// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  return password.length >= 8 && passwordRegex.test(password);
};

// Phone number validation (10 digits)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Name validation
export const isValidName = (name) => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Course code validation
export const isValidCourseCode = (code) => {
  const codeRegex = /^[A-Z0-9]+$/;
  return code.length >= 2 && code.length <= 20 && codeRegex.test(code);
};

// Rating validation
export const isValidRating = (rating) => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

// Feedback message validation
export const isValidFeedbackMessage = (message) => {
  return message.trim().length >= 10 && message.trim().length <= 1000;
};

// File validation for image upload
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) return { isValid: false, error: 'No file selected' };
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' };
  }
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};

// Form validation helpers
export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (name, email, password, confirmPassword) => {
  const errors = {};
  
  if (!name) {
    errors.name = 'Name is required';
  } else if (!isValidName(name)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }
  
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProfileForm = (name, phone, dateOfBirth, address) => {
  const errors = {};
  
  if (!name) {
    errors.name = 'Name is required';
  } else if (!isValidName(name)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }
  
  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }
  
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13 || age > 100) {
      errors.dateOfBirth = 'Please enter a valid date of birth';
    }
  }
  
  if (address && address.length > 200) {
    errors.address = 'Address cannot exceed 200 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePasswordChange = (currentPassword, newPassword, confirmPassword) => {
  const errors = {};
  
  if (!currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  if (!newPassword) {
    errors.newPassword = 'New password is required';
  } else if (!isValidPassword(newPassword)) {
    errors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }
  
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFeedbackForm = (course, rating, message) => {
  const errors = {};
  
  if (!course) {
    errors.course = 'Please select a course';
  }
  
  if (!rating || rating === 0) {
    errors.rating = 'Please provide a rating';
  } else if (!isValidRating(rating)) {
    errors.rating = 'Rating must be between 1 and 5';
  }
  
  if (!message) {
    errors.message = 'Feedback message is required';
  } else if (!isValidFeedbackMessage(message)) {
    errors.message = 'Feedback message must be between 10 and 1000 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCourseForm = (name, code, description, instructor, credits) => {
  const errors = {};
  
  if (!name) {
    errors.name = 'Course name is required';
  } else if (name.length < 2 || name.length > 100) {
    errors.name = 'Course name must be between 2 and 100 characters';
  }
  
  if (!code) {
    errors.code = 'Course code is required';
  } else if (!isValidCourseCode(code)) {
    errors.code = 'Course code must be 2-20 characters with only uppercase letters and numbers';
  }
  
  if (description && description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  
  if (instructor && instructor.length > 100) {
    errors.instructor = 'Instructor name cannot exceed 100 characters';
  }
  
  if (credits && (credits < 1 || credits > 10)) {
    errors.credits = 'Credits must be between 1 and 10';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility functions
export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getRatingColor = (rating) => {
  if (rating >= 4) return 'success';
  if (rating >= 3) return 'warning';
  return 'error';
};

export const getRatingText = (rating) => {
  if (rating >= 4) return 'Excellent';
  if (rating >= 3) return 'Good';
  if (rating >= 2) return 'Fair';
  return 'Poor';
};

// Export validation patterns for reuse
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE: /^\d{10}$/,
  COURSE_CODE: /^[A-Z0-9]+$/
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  INVALID_PHONE: 'Phone number must be 10 digits',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_RATING: 'Rating must be between 1 and 5',
  INVALID_NAME: 'Name must be between 2 and 50 characters',
  INVALID_COURSE_CODE: 'Course code must contain only uppercase letters and numbers'
};