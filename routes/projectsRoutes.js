const express = require("express");
const router = express.Router();
const { getAllCraftedProjects } = require("../controllers/projectsController");

router.get("/crafted", getAllCraftedProjects);

module.exports = router;
