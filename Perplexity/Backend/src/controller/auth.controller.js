import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Sendemail } from "../services/mail.service.js";

export async function RegisterController(req, res) {
  const { username, email, password } = req.body;
  const isUserExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserExist) {
    return res.status(400).json({
      message: "User is Already Exist!",
      success: false,
      err: "User Already Exist!",
    });
  }

  const User = await userModel.create({ username, email, password });
  const emailVerify = jwt.sign(
    {
      id: User._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  await Sendemail(
    email,
    "Welcome to Perplexity!",
    `Hi ${username},\n\nThank you for registering at Perplexity! We're excited to have you on board.\n\nBest regards,\nThe Perplexity Team`,
    `<p>Hi ${username},</p><p>Thank you for registering at Perplexity! We're excited to have you on board.</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerify}">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br>The Perplexity Team</p>`,
  );

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user: {
      id: User._id,
      username: User.username,
      email: User.email,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email: email,
  });
  if (!user) {
    return res.status(400).json({
      message: "Invalid emailor password",
      success: false,
      err: "user not found",
    });
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({
      message: "Invalid Email or Password",
      sucess: false,
      err: "Incorrect password",
    });
  }

  if (!user.verified) {
    return res.status(400).json({
      message: "please verify your email before logging",
      sucess: false,
      err: "Email not verified",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token",token);

  res.status(200).json({
    message:"login sucessfull",
    sucess:true,
    user:{
        id:user._id,
        username:user.username,
        email:user.email
    }
  })

}

export async function getMe(req,res){
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if(!user){
        return res.status(404).json({
            message:"user not found",
            success:false,
            err:"user not found"
        })
    }
    return res.status(200).json({
        message:"user details fetched successfully",
        success:true,
        user
    })
}
export async function verifyEmail(req, res) {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    user.verified = true;
    await user.save();

    const html = `
  
   <h1>Email Verified Successfully</h1>
        <p>Your Email has been verified. you can now log in to your account.</p>
    <a href="http://localhost:3000/login">Go to Login</a>
  `;

    res.send(html);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token",
      success: false,
      err: err.message,
    });
  }
}
 