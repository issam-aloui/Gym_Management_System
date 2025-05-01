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
  // Validate gym name length between 5 and 20 characters
  body("gymname")
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage("Gym name must be between 5 and 20 characters"),

  // Validate email format
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  // Validate phone number format (Algerian phone format)
  body("phonenumber")
    .trim()
    .matches(/^(?:\+213|0)(5|6|7|2)[0-9]{8}$/) // Algerian phone format
    .withMessage("Invalid Algerian phone number format"),

  // Validate town length between 4 and 10 characters
  body("town")
    .isLength({ min: 4, max: 10 })
    .withMessage("Town name must be between 4 and 10 characters"),

  // Validate price per month to be between 0 and 10000
  body("pricebymounth")
    .isInt({ min: 0, max: 10000 })
    .withMessage("Price per month must be between 0 and 10,000"),

  // Middleware to check if there are validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("haha1");
      return res.status(400).json({ errors: errors.array() });
      console.log("haha12");

    }

    next();
  },
];
