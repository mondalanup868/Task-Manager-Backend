import express from "express";
import otpGenerator from "otp-generator";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js"; // ✅ Brevo service
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

// ✅ LOGIN
router.post("/login", loginUser);




// ✅ 1) SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("Email received:", email);

    // check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered ❌" });
    }

    // generate otp
    const generatedOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    // delete old otp
    await Otp.deleteMany({ email });

    // save otp
    await Otp.create({
      email,
      otp: generatedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // ✅ send otp using BREVO API
    await sendEmail(
      email,
      "OTP Verification - Employee Task Manager",
      generatedOtp
    );

    res.json({ message: "OTP sent successfully ✅" });
  } catch (error) {
    console.log("❌ SEND OTP ERROR:", error);
    // console.log("❌ Brevo Email error:", error?.response?.body || error);
    res.status(500).json({ message: "Failed to send OTP ❌" });
  }
});




// ✅ 2) VERIFY OTP + REGISTER USER
router.post("/verify-otp-register", async (req, res) => {
  try {
    const { name, email, empid, team, password, otp } = req.body;

    // check user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered ❌" });
    }

    // check otp
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found ❌" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired ❌" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      empid,
      team,
      password: hashedPassword,
    });

    // delete otp after success
    await Otp.deleteMany({ email });

    res.json(user);
  } catch (error) {
    console.log("❌ VERIFY OTP REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed ❌" });
  }
});

export default router;
