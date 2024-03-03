import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";
import path from "path";

// Import Models
import User from "../models/userModel.js";
import PasswordReset from "../models/passwordReset.js";
import BlackList from "../models/blackList.js";
import Otp from "../models/otp.js";

// Import helpers
import { validationResult } from "express-validator";
import { sendMail } from "../helpers/mailer.js";
import deleteFile from "../helpers/deleteFile.js";
import { oneMinuteExpiry, threeMinuteExpiry } from "../helpers/otpValidate.js";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";

// Method of Access Token
const generateAccessToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  });
  return token;
};

// Method of Refresh Token
const generateRefreshToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2d",
  });
  return token;
};

// Method of Generate Random 4 Digit
const generateRandom4Digit = async () => {
 return  Math.floor(1000 + Math.random() * 9000);
};

// Regiter User __ { User Route }
const userRegister = async (req, res) => {
  try {
    // Validate middleware
    const errors = validationResult(req);

    // Validate email error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    // Getting data
    const { name, email, mobile, password } = req.body;
    // Exists Email
    const isExits = await User.findOne({ email });

    if (isExits) {
      return res.status(400).json({
        success: false,
        msg: "Email Already Exists",
      });
    }

    // Hashed Password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Get data in variables
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      image: "image/" + req.files.image[0].filename,
      document: "document/" + req.files.document[0].filename,
    });

    // Save data in Db
    const userData = await user.save();

    // Verification Email Send content
    const msg =
      "<p> Hii " +
      name +
      ', Please <a href="http://127.0.0.1:9999/mail-verification?id=' +
      userData._id +
      '" > Verify </a> your email. </p>';

      const payload = [
        {
          email: email,
          subject: "Email Verification",
          content: msg,
        },
        {
          email: email,
          subject: "Thank you for Join Us",
          content: `<h1>Hello ${userData.name} you got this amazing offer for Join Us 😊 </h1>`,
        }
      ];

    // Send mail method
    // await sendMail(email, "Mail Verfication", msg);

    // Send email by Queue
    await emailQueue.add(emailQueueName, payload);

    return res.status(200).json({
      success: true,
      msg: "Register successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Mail Verification during register __ { Auth Route }
const mailVerification = async (req, res) => {
  try {
    if (req.query.id == undefined) {
      return res.render('404');
    }

    const userData = await User.findOne({ _id: req.query.id });

    if (userData) {
      if (userData.is_verified == 1) {
        return res.render('mail-verification', {
          message: "Your email already verified",
        });
      }
      await User.findByIdAndUpdate(
        { _id: req.query.id },
        {
          $set: {
            is_verified: 1,
          },
        }
      );

      return res.render('mail-verification', {
        message: "Mail has been verified successfully",
      });
    } else {
      return res.render('mail-verification', { message: "User Not Found" });
    }
  } catch (error) {
    console.log(error.message);
    return res.render('404');
  }
};

// Resend Mail verification after register __ { User Route }
const sendMailVerification = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Validate email verification errors
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email doesn't Exists",
      });
    }

    if (userData.is_verified == 1) {
      return res.status(400).json({
        success: false,
        msg: userData.email + ' ' + "Email is already verified",
      });
    }

    const msg =
      "<p> Hii " +
      userData.name +
      ', Please <a href="http://127.0.0.1:9999/mail-verification?id=' +
      userData._id +
      '" > Verify </a> your email. </p>';

    // Send mail method
    const resentMail = await sendMail(userData.email, "Mail Verfication", msg);

    if (resentMail == undefined) {
      return res.status(200).json({
        success: true,
        msg: "Verification mail send to your email",
      });
    } else {
      return res.status(400).json({
        success: false,
        msg: "Resent Verification mail not send",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Forget Password __ { User Route }
const forgetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Validate email verification errors
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email doesn't Exists",
      });
    }

    const randomString = randomstring.generate();
    const msg =
      "<p>Hi " +
      userData.name +
      ', Please click <a href="http://127.0.0.1:9999/reset-password?token=' +
      randomString +
      '"> Here </a> to reset your password </p>';

    await PasswordReset.deleteMany({ user_id: userData._id });

    const passwordReset = new PasswordReset({
      user_id: userData._id,
      token: randomString,
    });
    await passwordReset.save();

    await sendMail(userData.email, "Reset Password", msg);

    return res.status(201).json({
      success: true,
      msg: "Reset password link send to your email , please check",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Reset Password with Ejs __ { Auth Route }
const resetPassword = async (req, res) => {
  try {
    if (req.query.token == undefined) {
      return res.render('404');
    }


    const resetData = await PasswordReset.findOne({ token: req.query.token });

    if (!resetData) {
      return res.render('404');
    }

    return res.render('reset-password', { resetData });
  } catch (error) {
    return res.render('404');
  }
};

// Update Password  __ { Auth Route } reset password method
const updatePassword = async (req, res) => {
  try {
    const { user_id, password, c_password } = req.body;

    const resetData = await PasswordReset.findOne({ user_id });

    if (password != c_password) {
      return res.render("reset-password", {
        resetData,
        error: "Confirm Password not match",
      });
    }

    const hashedPassword = await bcrypt.hashSync(c_password, 10);

    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    PasswordReset.deleteMany({ user_id });

    return res.redirect("/reset-success");
  } catch (error) {
    return res.render("404");
  }
};

// Reset Succcess __ { Auth Route }
const resetSuccess = async (req, res) => {
  try {
    return res.render("reset-success");
  } catch (error) {
    return res.render("404");
  }
};

// Login User __ { User Route }
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email and Password is incorrect",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        msg: "Email and Password is incorrect",
      });
    }

    if (userData.is_verified == 0) {
      return res.status(400).json({
        success: false,
        msg: "Email is not verified , Please verify email ",
      });
    }

    const accessToken = await generateAccessToken({ user: userData });
    const refreshToken = await generateRefreshToken({ user: userData });


    return res.status(200).json({
      success: true,
      msg: "Login Successsfully",
      user: userData,
      accesstoken: accessToken,
      refreshToken: refreshToken,
      tokenType: "Bearer",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Get User Profile __ { User Profile }
const userProfile = async (req, res) => {
  try {
    const userData = req.user.user;

    return res.status(200).json({
      success: true,
      msg: "User Profile Data",
      data: userData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Update user profile __ { Update Profile }
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Validate email error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { name, mobile } = req.body;

    const data = {
      name,
      mobile,
    };

    const user_id = req.user.user._id;

    if (req.file != undefined) {
      data.image = "image/" + req.file.filename;

      const oldUser = await User.findOne({ _id: user_id });

      const oldFilePath = path.join(__dirname, "../public" + oldUser.image);

      deleteFile(oldFilePath);
    }

    const userData = await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: data,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "User Updated Successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Refresh Token __ { User Route }
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.user._id;

    const userData = await User.findOne({ _id: userId });

    const accessToken = await generateAccessToken({ user: userData });
    const refreshToken = await generateRefreshToken({ user: userData });

    return res.status(200).json({
      success: true,
      msg: "Token Refreshed",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Logout __ { User Route }
const logout = async (req, res) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["authorization"];

    const bearer = token.split(" ");

    const bearerToken = bearer[1];

    const newBlacklist = new BlackList({ token: bearerToken });

    await newBlacklist.save();

    res.setHeader('Clear-Site-Data', '"cookies", "storage"');

    return res.status(200).json({
      success: true,
      msg: "You are logged out successfull",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Send Email Otp __ { User Route }
const sendOtp = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Validate email verification errors
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email doesn't Exists",
      });
    }

    if (userData.is_verified == 1) {
      return res.status(400).json({
        success: false,
        msg: userData.email + ' ' + "Email is already verified",
      });
    }

    const generate_otp = await generateRandom4Digit();

    const oldOtpdata = await Otp.findOne({ user_id: userData._id });
    
    if (oldOtpdata) {
      const sendNextOtp = await oneMinuteExpiry(oldOtpdata.timestamp);
      if (!sendNextOtp) {
        return res.status(400).json({
          success: false,
          msg: "Please try after 1 minute",
        });
      }
    }

    const current_date = new Date();

    await Otp.findOneAndUpdate(
      { user_id: userData._id },
      { otp: generate_otp, timestamp: new Date(current_date.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // const enter_otp = new Otp({
    //   user_id: userData.id,
    //   otp: generate_otp,
    // });

    // await enter_otp.save();

    const msg =
      "<p> Hii <b>" +
      userData.name +
      "<b/> , <h4>" +
      generate_otp +
      "</h4> </p>";

    // Send mail method
    await sendMail(userData.email, "Otp verification", msg);

    return res.status(200).json({
      success: true,
      msg: "Otp has been send to your email",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

// Verify Otp __ { User Route }
const verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Validate email error
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { user_id, otp } = req.body;

    const otpData = await Otp.findOne({
      user_id,
      otp,
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        msg: "You entered wrong otp",
      });
    }

    const isOtpExpired = await threeMinuteExpiry(otpData.timestamp);

    if (isOtpExpired) {
      return res.status(400).json({
        success: false,
        msg: "Your otp has been expired",
      });
    }

    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          is_verified: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      msg: "Your account has been verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

export {
  userRegister,
  mailVerification,
  sendMailVerification,
  forgetPassword,
  resetPassword,
  updatePassword,
  resetSuccess,
  loginUser,
  userProfile,
  updateProfile,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp,
};
