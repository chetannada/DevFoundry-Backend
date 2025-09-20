const express = require("express");
const authRoutes = require("./authRoutes");
const buildRoutes = require("./buildRoutes");
const { baseRoot } = require("../controllers/authController");

const router = express.Router();

router.get("/", baseRoot);
router.use("/auth", authRoutes);
router.use("/builds", buildRoutes);

module.exports = router;
