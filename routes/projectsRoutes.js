const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  addProject,
  deleteProject,
  updateProject,
  reviewProject,
  restoreProject,
} = require("../controllers/projectsController");
const authenticateUser = require("../middleware/auth");
const optionallyAuthenticateUser = require("../middleware/optionallyAuth");

router.get("/get", optionallyAuthenticateUser, getAllProjects);

router.post("/add", addProject);

router.delete("/delete/:id", deleteProject);

router.put("/update/:id", updateProject);

router.put("/review/:id", authenticateUser, reviewProject);

router.put("/restore/:id", authenticateUser, restoreProject);

module.exports = router;
