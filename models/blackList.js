import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BlackList = mongoose.model("BlackList", blackListSchema);

export default BlackList;
