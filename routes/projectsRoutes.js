const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  addProject,
  deleteProject,
  updateProject,
} = require("../controllers/projectsController");

router.get("/get", getAllProjects);

router.post("/add", addProject);

router.delete("/delete/:id", deleteProject);

router.put("/update/:id", updateProject);

module.exports = router;
