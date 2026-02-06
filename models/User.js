import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    empid: { type: String, required: true, unique: true },
    team: { type: String , enum: ["Development Team", "IT Team", "Operations Team"], default: "Development Team" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
