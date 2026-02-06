import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ❌ NORMAL REGISTER (OPTIONAL)
// You can keep it, but you are not using it now because OTP system registers user
export const registerUser = async (req, res) => {
  try {
    const { name, email, empid, team, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email already exists" });

    const empidExists = await User.findOne({ empid });
    if (empidExists)
      return res.status(400).json({ message: "Employee ID already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      empid,
      team,
      password: hashed,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      empid: user.empid,
      team: user.team,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: "Register failed ❌" });
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      empid: user.empid,
      team: user.team,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("❌ LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed ❌" });
  }
};
