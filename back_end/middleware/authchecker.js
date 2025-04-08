const { body, validationResult } = require("express-validator");

exports.validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .isLength({ min: 6, max: 25 })
    .withMessage("Password must be between 6 and 25 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateLogin = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];



exports.validateGym = [
  body("gymname")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  body("phonenumber")
    .trim()
    .matches(/^(?:\+213|0)(5|6|7|2)[0-9]{8}$/) // Algerian phone format
    .withMessage("Invalid Algerian phone number format"),

  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("town")
    .isLength({ min: 4, max: 10 })
    .withMessage("town must be between 6 and 25 characters"),
  body("pricebymounth")
    .isInt({ min: 0 , max : 10000})
    .withMessage("price must be a positive or zero"),  
  

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

