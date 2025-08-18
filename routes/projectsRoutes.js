const express = require("express");
const router = express.Router();
const {
  getAllCraftedProjects,
  addCraftedProject,
} = require("../controllers/projectsController");

router.get("/crafted", getAllCraftedProjects);

router.post("/crafted/add", addCraftedProject);

module.exports = router;
