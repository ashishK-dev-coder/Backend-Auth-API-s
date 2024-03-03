import jwt from "jsonwebtoken";
import BlackList from "../models/blackList.js";

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      success: false,
      msg: "A token is required for authentication",
    });
  }

  try {
    const bearer = token.split(" ");
    const bearerToken = bearer[1];

    const blackListedToken = await BlackList.findOne({ token: bearerToken})

    if (blackListedToken) {
      return res.status(400).json({
        success: false,
        msg: "This session has been expired , Please login again",
      });
    }

    const decodedData = jwt.verify(
      bearerToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    req.user = decodedData;
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Invalid Token",
    });
  }

  return next();
};

export default verifyToken;
