"""
Rate Limiter Middleware for production-level API protection.
Implements a sliding window rate limiting algorithm using in-memory storage.
For distributed deployments, replace with Redis-based implementation.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
import asyncio
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    In-memory rate limiter using sliding window algorithm.
    Thread-safe for async operations.
    """
    
    def __init__(self, requests_per_window: int = 100, window_seconds: int = 60):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self._requests: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    def _get_client_id(self, request: Request) -> str:
        """Extract client identifier from request."""
        # Use X-Forwarded-For for proxied requests, fallback to client host
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    async def _cleanup_old_requests(self, client_id: str) -> None:
        """Remove expired request timestamps."""
        cutoff = datetime.utcnow() - timedelta(seconds=self.window_seconds)
        self._requests[client_id] = [
            ts for ts in self._requests[client_id] if ts > cutoff
        ]
    
    async def check_rate_limit(self, request: Request) -> Tuple[bool, int, int]:
        """
        Check if request is within rate limit.
        Returns: (allowed, remaining_requests, reset_time_seconds)
        """
        client_id = self._get_client_id(request)
        
        async with self._lock:
            await self._cleanup_old_requests(client_id)
            
            current_requests = len(self._requests[client_id])
            remaining = max(0, self.requests_per_window - current_requests)
            
            if current_requests >= self.requests_per_window:
                # Calculate reset time
                oldest_request = min(self._requests[client_id])
                reset_time = int((oldest_request + timedelta(seconds=self.window_seconds) - datetime.utcnow()).total_seconds())
                return False, 0, max(1, reset_time)
            
            # Record this request
            self._requests[client_id].append(datetime.utcnow())
            return True, remaining - 1, self.window_seconds
    
    async def get_stats(self) -> dict:
        """Get rate limiter statistics for monitoring."""
        async with self._lock:
            return {
                "active_clients": len(self._requests),
                "total_tracked_requests": sum(len(reqs) for reqs in self._requests.values()),
            }


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    """
    FastAPI middleware for rate limiting.
    Adds rate limit headers to all responses.
    """
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    allowed, remaining, reset_time = await rate_limiter.check_rate_limit(request)
    
    if not allowed:
        logger.warning(f"Rate limit exceeded for client: {rate_limiter._get_client_id(request)}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
            headers={
                "X-RateLimit-Limit": str(rate_limiter.requests_per_window),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "Retry-After": str(reset_time),
            }
        )
    
    response = await call_next(request)
    
    # Add rate limit headers to response
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.requests_per_window)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)
    
    return response
