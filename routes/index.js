const express = require("express");
const authRoutes = require("./authRoutes");
const projectRoutes = require("./projectsRoutes");
const { baseRoot } = require("../controllers/authController");

const router = express.Router();

router.get("/", baseRoot);
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);

module.exports = router;
