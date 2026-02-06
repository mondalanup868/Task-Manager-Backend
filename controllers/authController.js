import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  const { name, email, empid, team, password } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) return res.status(400).json({ message: "Email already exists" });

  const empidExists = await User.findOne({ empid });
  if (empidExists) return res.status(400).json({ message: "Employee ID already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

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
};



export const loginUser = async (req, res) => {
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


};
