import Task from "../models/Task.js";

export const addTask = async (req, res) => {
  const { date, tasks } = req.body;

  let record = await Task.findOne({ userId: req.user.id, date });

  if (record) {
    record.tasks = tasks;
    await record.save();
    return res.json({ message: "Task updated", record });
  }

  record = await Task.create({
    userId: req.user.id,
    date,
    tasks,
  });

  res.json({ message: "Task saved", record });
};

export const getTasksByRange = async (req, res) => {
  const { from, to } = req.query;

  const records = await Task.find({
    userId: req.user.id,
    date: { $gte: from, $lte: to },
  }).sort({ date: 1 });

  res.json(records);
};
