const express = require("express");
const authRoutes = require("./authRoutes");
const buildRoutes = require("./buildRoutes");
const githubRoutes = require("./githubRoutes");
const weatherRoutes = require("./weatherRoutes");
const aiRoutes = require("./aiRoutes");
const wordCounterRoutes = require("./wordCounterRoutes");
const { baseRoot } = require("../controllers/authController");

const router = express.Router();

router.get("/", baseRoot);
router.use("/auth", authRoutes);
router.use("/builds", buildRoutes);
router.use("/github", githubRoutes);
router.use("/ai", aiRoutes);
router.use("/weather", weatherRoutes);
router.use("/word-counter", wordCounterRoutes);

module.exports = router;
