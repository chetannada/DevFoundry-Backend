const express = require("express");
const router = express.Router();
const {
  getAllCraftedProjects,
  addCraftedProject,
  deleteCraftedProject,
} = require("../controllers/projectsController");

router.get("/crafted/get", getAllCraftedProjects);

router.post("/crafted/add", addCraftedProject);

router.delete("/crafted/delete/:id", deleteCraftedProject);

module.exports = router;
