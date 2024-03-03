import express from "express";

const router = express();

router.use(express.json());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Controllers
import {
  mailVerification,
  resetPassword,
  resetSuccess,
  updatePassword,
} from "../controllers/userController.js";
import bodyParser from "body-parser";

// Route Declartion
router.get("/mail-verification", mailVerification); // ejs email message send
router.get("/reset-password", resetPassword); // ejs email message sent
router.post("/reset-password", updatePassword);
router.get("/reset-success", resetSuccess);

export default router;
