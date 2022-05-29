const mongoose = require("../../database");
const bcrypy = require("bcryptjs");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  finishedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
