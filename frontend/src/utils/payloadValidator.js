/**
 * Payload Validator - Validates and sanitizes API payloads
 * This ensures frontend payloads match backend schema expectations exactly
 */

/**
 * Validate user registration payload
 * Backend expects: email, full_name, phone_number (optional), role, password
 */
export const validateRegistrationPayload = (data) => {
  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    throw new Error('Email is required');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email format');
  }

  // Full name validation
  if (!data.full_name || typeof data.full_name !== 'string') {
    throw new Error('Full name is required');
  }
  const cleanedName = data.full_name.trim();
  if (cleanedName.length === 0 || cleanedName.length > 100) {
    throw new Error('Full name must be 1-100 characters');
  }

  // Role validation
  const validRoles = ['customer', 'maid'];
  if (!data.role || !validRoles.includes(data.role)) {
    throw new Error('Invalid role. Must be "customer" or "maid"');
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    throw new Error('Password is required');
  }
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (data.password.length > 128) {
    throw new Error('Password is too long (max 128 characters)');
  }
  const hasLetter = /[a-zA-Z]/.test(data.password);
  const hasNumber = /\d/.test(data.password);
  if (!hasLetter || !hasNumber) {
    throw new Error('Password must contain at least one letter and one number');
  }

  // Build validated payload
  const validated = {
    email: data.email.trim().toLowerCase(),
    full_name: cleanedName,
    role: data.role,
    password: data.password,
  };

  // Phone number is optional
  if (data.phone_number && typeof data.phone_number === 'string') {
    const cleanedPhone = data.phone_number.trim();
    if (cleanedPhone.length > 0 && cleanedPhone.length <= 20) {
      validated.phone_number = cleanedPhone;
    }
  }

  return validated;
};

/**
 * Validate booking creation payload
 * Backend expects: maid_id, service_type, booking_date (ISO datetime), time_slot, notes (optional)
 */
export const validateBookingPayload = (data) => {
  // Validate required fields first
  if (!data.maid_id) throw new Error('Maid ID is required');
  if (!data.booking_date) throw new Error('Booking date is required');
  const timeSlot = data.booking_time || data.time_slot;
  if (!timeSlot) throw new Error('Time slot is required');

  // Convert date string to ISO datetime string
  // Frontend sends: "2025-11-20" (date input)
  // Backend expects: "2025-11-20T10:00:00" (ISO datetime)
  let bookingDateTime;
  try {
    // Parse the date string
    const dateStr = data.booking_date; // Format: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Invalid date format');
    }

    // Combine date with time to create ISO string
    const timeStr = timeSlot; // Format: HH:MM
    if (!/^\d{2}:\d{2}$/.test(timeStr)) {
      throw new Error('Invalid time format');
    }

    // Create ISO datetime string
    bookingDateTime = `${dateStr}T${timeStr}:00`;
  } catch (e) {
    throw new Error('Invalid booking date or time format');
  }

  const validated = {
    maid_id: data.maid_id,
    service_type: data.service_type || 'house_cleaning', // default service type
    booking_date: bookingDateTime, // Send as ISO string (Pydantic will parse)
    time_slot: timeSlot,
    ...(data.special_notes && { notes: data.special_notes }),
  };

  return validated;
};

/**
 * Validate review creation payload
 * Backend expects: booking_id, rating (1-5), comment (optional)
 */
export const validateReviewPayload = (data) => {
  const validated = {
    booking_id: data.booking_id,
    rating: parseFloat(data.rating),
    ...(data.comment && { comment: data.comment.trim() }),
  };

  // Validate required fields
  if (!validated.booking_id) throw new Error('Booking ID is required');
  if (validated.rating < 1 || validated.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  return validated;
};

/**
 * Validate user update payload
 * Backend UserUpdate expects only: full_name, phone_number, bio, skills, experience_years, hourly_rate, availability_schedule
 * All fields are optional
 */
export const validateUserUpdatePayload = (data, userRole) => {
  const validated = {};

  // Personal information fields (all users)
  if (data.full_name !== undefined) {
    const name = data.full_name.trim();
    if (name.length > 0) {
      validated.full_name = name;
    }
  }

  if (data.phone_number !== undefined && data.phone_number.trim()) {
    validated.phone_number = data.phone_number.trim();
  }

  // Hourly rate (for both customers and maids)
  if (data.hourly_rate !== undefined && data.hourly_rate !== '' && data.hourly_rate !== 0) {
    const rate = parseFloat(data.hourly_rate);
    if (rate > 0 && rate <= 10000) {
      validated.hourly_rate = rate;
    }
  }

  // Maid-specific fields (only for maid role)
  if (userRole === 'maid') {
    if (data.bio !== undefined && data.bio.trim()) {
      validated.bio = data.bio.trim();
    }

    if (data.skills !== undefined && data.skills.trim()) {
      validated.skills = data.skills.trim();
    }

    if (data.experience_years !== undefined && data.experience_years !== '') {
      const years = parseInt(data.experience_years);
      if (years >= 0 && years <= 50) {
        validated.experience_years = years;
      }
    }

    if (data.availability_schedule !== undefined && data.availability_schedule.trim()) {
      validated.availability_schedule = data.availability_schedule.trim();
    }
  }

  return validated;
};

/**
 * Validate booking status update payload
 * Backend expects: status (optional), notes (optional)
 * Valid statuses: pending, accepted, completed, canceled
 */
export const validateBookingStatusPayload = (data) => {
  const validated = {};

  if (data.status) {
    const validStatuses = ['pending', 'accepted', 'completed', 'canceled'];
    if (!validStatuses.includes(data.status)) {
      throw new Error('Invalid booking status. Must be: pending, accepted, completed, or canceled');
    }
    validated.status = data.status;
  }

  if (data.notes !== undefined && data.notes.trim()) {
    validated.notes = data.notes.trim();
  }

  return validated;
};

/**
 * Get validation error message from Axios error response
 */
export const getApiErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail;
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail
        .map((err) => {
          if (typeof err === 'object' && err.msg) {
            return `${err.loc?.join('.')}: ${err.msg}`;
          }
          return String(err);
        })
        .join('; ');
    }
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.statusText) {
    return `${error.response.status} ${error.response.statusText}`;
  }

  return error.message || 'An error occurred';
};
