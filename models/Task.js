import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // store as YYYY-MM-DD
    tasks: [
      {
        title: String,
        description: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
