const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Project = require("../models/project");
const Task = require("../models/task");

const router = express.Router();

router.use(authMiddleware); //validating user token for this route

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

    const projectlist = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project: projectlist });
  } catch (e) {
    return res.status(400).send({ error: "Error creating new project:" + e });
  }
});

router.put("/", async (req, res) => {
  try {
    const { taskList } = req.body;
    const tasks = await Task.find({ _id: { $in: taskList } });

    await Promise.all(
      tasks.map(async (task) => {
        await Task.findByIdAndUpdate(
          task._id,
          {
            completed: !task.completed,
          },
          { new: true }
        );
      })
    );

    const project = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project });
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

    const projectlist = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project: projectlist });
  } catch (e) {
    return res.status(400).send({ error: "Error deleting project:" + e });
  }
});

module.exports = (app) => app.use("/tasks", router);
