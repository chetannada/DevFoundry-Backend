const express = require("express");
const authRoutes = require("./authRoutes");
const buildRoutes = require("./buildRoutes");
const githubRoutes = require("./githubRoutes");
const aiRoutes = require("./aiRoutes");
const { baseRoot } = require("../controllers/authController");

const router = express.Router();

router.get("/", baseRoot);
router.use("/auth", authRoutes);
router.use("/builds", buildRoutes);
router.use("/github", githubRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
