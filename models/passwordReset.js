import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
