/**
 * Input Validators according to Challenge Specifications:
 * - Name: Min 20 characters, Max 60 characters
 * - Address: Max 400 characters
 * - Password: 8-16 characters, must include at least one uppercase letter and one special character
 * - Email: Must follow standard email validation rules
 * - Rating: 1 to 5
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return `Name must be at least 20 characters long (currently ${trimmed.length} characters).`;
  }
  if (trimmed.length > 60) {
    return `Name cannot exceed 60 characters (currently ${trimmed.length} characters).`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return 'Address is required.';
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return 'Address cannot be empty.';
  }
  if (trimmed.length > 400) {
    return `Address cannot exceed 400 characters (currently ${trimmed.length} characters).`;
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be between 8 and 16 characters long (currently ${password.length} characters).`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (e.g. !@#$%^&*).';
  }
  return null;
};

export const validateRatingValue = (rating) => {
  const num = Number(rating);
  if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
};

// Express Middleware for Normal User Signup
export const validateSignupRequest = (req, res, next) => {
  const { name, email, address, password } = req.body;
  const errors = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Express Middleware for Admin Adding New User
export const validateCreateUserRequest = (req, res, next) => {
  const { name, email, address, password, role } = req.body;
  const errors = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  if (!role || !['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
    errors.role = 'Role must be one of ADMIN, USER, or STORE_OWNER.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Express Middleware for Admin Adding New Store
export const validateCreateStoreRequest = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Store name is required.';
  } else if (name.trim().length > 60) {
    errors.name = 'Store name cannot exceed 60 characters.';
  }

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addrErr = validateAddress(address);
  if (addrErr) errors.address = addrErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Express Middleware for Password Update
export const validatePasswordUpdateRequest = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  const passErr = validatePassword(newPassword);
  if (passErr) errors.newPassword = passErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};
