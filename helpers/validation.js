import { check } from "express-validator";

// Register validation
export const registerValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("mobile", "Mobile No. must be 10 digit").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Password must be greater than 6 character , and contain one uppercase letter - one lowercase - one number - one special charcter"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("image")
    .custom((value, { req }) => {
      if (
        req.files.image[0].mimetype === "image/jpeg" ||
        req.files.image[0].mimetype === "image/png"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please upload an image .jpeg , .png"),
  check("document")
    .custom((value, { req }) => {
      if (
        req.files.document[0].mimetype === "application/msword" ||
        req.files.document[0].mimetype === "application/pdf"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("Please upload pdf or doc format"),
];

// Send mail verification validator
export const sendMailVerificationValidator = [
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

// Password Reset validation
export const passwordResetValidator = [
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

// Login validation
export const loginValidator = [
  check("password", "Password is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

// Update profile validator
export const updateProfileValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("mobile", "Mobile No. must be 10 digit").isLength({
    min: 10,
    max: 10,
  }),
];

// Send Otp validator
export const sendOtpValidator = [
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

// Verify Otp validator
export const verifyOtpValidator = [
  check("user_id", "User Id is required ").not().isEmpty(),
  check("otp", "OTP is required ").not().isEmpty(),
];
