import express from "express";
import multer from "multer";

const router = express();

router.use(express.json());

router.use(express.static("public"));

// Multer ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, "./public/image");
    } else {
      cb(null, "./public/document");
    }
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },

  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

// File-Filter ---
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    file.mimetype === "image/jpeg" || file.mimetype === "image/png"
      ? cb(null, true)
      : cb(null, false);
  } else if (file.fieldname === "document") {
    file.mimetype === "application/msword" ||
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(null, false);
  }
};

// File Upload on Server
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).fields([
  { name: "document", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

// import Controllers
import {
  forgetPassword,
  loginUser,
  logout,
  refreshToken,
  sendMailVerification,
  sendOtp,
  updateProfile,
  userProfile,
  userRegister,
  verifyOtp,
} from "../controllers/userController.js";
import {
  loginValidator,
  passwordResetValidator,
  registerValidator,
  sendMailVerificationValidator,
  sendOtpValidator,
  updateProfileValidator,
  verifyOtpValidator,
} from "../helpers/validation.js";

// Auth Routes
router.post("/register", upload, registerValidator, userRegister);
router.post(
  "/send-mail-verification",
  sendMailVerificationValidator,
  sendMailVerification
);
router.post("/forget-password", passwordResetValidator, forgetPassword);
router.post("/login", loginValidator, loginUser);

// Secure route
import authMiddleware from "../middleware/auth.js";

router.get("/profile", authMiddleware, userProfile);
router.post(
  "/update-profile",
  authMiddleware,
  upload,
  updateProfileValidator,
  updateProfile
);
router.post("/refresh-token", authMiddleware, refreshToken);
router.post("/logout", authMiddleware, logout);

// Send-Otp
router.post("/send-email-otp", sendOtpValidator, sendOtp);
router.post("/verify-email-otp", verifyOtpValidator, verifyOtp);

export default router;
