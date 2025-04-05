const { body, validationResult } = require("express-validator");

// Middleware to validate signup requests
exports.validateSignup = [
  // Validate username: must be between 3 and 20 characters
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),

  // Validate email: must be a valid email format
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  // Validate password: must be between 6 and 25 characters and contain at least one number
  body("password")
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6 and 25 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware to validate login requests
exports.validateLogin = [
  // Validate username: must not be empty
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  // Validate password: must not be empty
  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware to validate gym creation requests
exports.validateGym = [
  // Validate gym name: must be between 5 and 20 characters
  body("gymname")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),

  // Validate email: must be a valid email format
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  // Validate phone number: must match Algerian phone number format
  body("phonenumber")
    .trim()
    .matches(/^(?:\+213|0)(5|6|7|2)[0-9]{8}$/) // Algerian phone format
    .withMessage("Invalid Algerian phone number format"),

  // Validate latitude: must be between -90 and 90
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  // Validate longitude: must be between -180 and 180
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  // Validate town: must be between 4 and 10 characters
  body("town")
    .isLength({ min: 4, max: 10 })
    .withMessage("town must be between 6 and 25 characters"),

  // Validate price by month: must be a positive integer or zero, and less than or equal to 10,000
  body("pricebymounth")
    .isInt({ min: 0, max: 10000 })
    .withMessage("price must be a positive or zero"),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
