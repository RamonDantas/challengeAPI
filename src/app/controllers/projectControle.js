const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Project = require("../models/project");
const Task = require("../models/task");

const router = express.Router();

router.use(authMiddleware); //validating user token for this route

router.get("/", async (req, res) => {
  try {
    const project = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project });
  } catch (e) {
    return res.status(400).send({ error: "Error loading projects:" + e });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project });
  } catch (e) {
    return res.status(400).send({ error: "Error loading projects:" + e });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, tasks } = req.body;
    const project = await Project.create({
      title,
      user: req.userId,
    });
    await Promise.all(
      tasks.map(async (task) => {
        const projectTask = new Task({ ...task, project: project._id });
        await projectTask.save();
        project.tasks.push(projectTask);
      })
    );
    await project.save();

    const projectlist = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project: projectlist });
  } catch (e) {
    return res.status(400).send({ error: "Error creating new project:" + e });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    const { title, tasks } = req.body;
    await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        title,
        user: req.userId,
        tasks,
      },
      { new: true }
    );

    const project = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project });
  } catch (e) {
    return res.status(400).send({ error: "Error updating project:" + e });
  }
});

router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId);
    await Task.find({ project: req.params.projectId }).deleteMany();

    const project = await Project.find({ user: req.userId }).populate([
      "user",
      "tasks",
    ]);

    return res.send({ project });
  } catch (e) {
    return res.status(400).send({ error: "Error deleting project:" + e });
  }
});

module.exports = (app) => app.use("/projects", router);
