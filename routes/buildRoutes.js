const express = require("express");
const router = express.Router();
const {
  getAllBuilds,
  addBuild,
  deleteBuild,
  updateBuild,
  reviewBuild,
  restoreBuild,
  favoriteBuild,
} = require("../controllers/buildController");
const authenticateUser = require("../middleware/auth");
const optionallyAuthenticateUser = require("../middleware/optionallyAuth");

router.get("/get", optionallyAuthenticateUser, getAllBuilds);

router.post("/add", addBuild);

router.delete("/delete/:id", deleteBuild);

router.put("/update/:id", updateBuild);

router.put("/review/:id", authenticateUser, reviewBuild);

router.put("/restore/:id", authenticateUser, restoreBuild);

router.post("/favorites/:buildId", authenticateUser, favoriteBuild);

module.exports = router;
