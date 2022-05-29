const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Project = require("../models/project");
const Task = require("../models/task");

const router = express.Router();

router.use(authMiddleware); //validating user token for this route

// router.get("/", async (req, res) => {
//   try {
//     const task = await Task.find({ user: req.userId }).populate([
//       "user",
//       "tasks",
//     ]);

//     return res.send({ task });
//   } catch (e) {
//     return res.status(400).send({ error: "Error loading tasks:" + e });
//   }
// });

// router.get("/:taskId", async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.taskId).populate([
//       "user",
//       "tasks",
//     ]);

//     return res.send({ task });
//   } catch (e) {
//     return res.status(400).send({ error: "Error loading tasks:" + e });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const { title, project, finishedDate } = req.body;
    const task = await Task.create({
      title,
      project,
      finishedDate,
    });

    const projectUpdate = await Project.findById(project);
    projectUpdate.tasks.push(task._id);
    await projectUpdate.save();

    return res.send({ projectUpdate });
  } catch (e) {
    return res.status(400).send({ error: "Error creating new project:" + e });
  }
});

router.put("/:taskId", async (req, res) => {
  try {
    const { title, completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        title,
        completed,
      },
      { new: true }
    );

    return res.send({ task });
  } catch (e) {
    return res.status(400).send({ error: "Error updating task:" + e });
  }
});

router.delete("/:taskId", async (req, res) => {
  try {
    await Task.findByIdAndRemove(req.params.taskId);
    const project = await Project.findOne({
      tasks: { $in: req.params.taskId },
    });
    project.tasks = [];
    const task = await Task.find({ project: project._id });
    project.tasks = task;

    await project.save();

    return res.send({ ok: true });
  } catch (e) {
    return res.status(400).send({ error: "Error deleting project:" + e });
  }
});

module.exports = (app) => app.use("/tasks", router);
