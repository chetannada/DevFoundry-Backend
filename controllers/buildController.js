const { getModelByType, validateType } = require("../utils/buildType");
const buildService = require("../services/buildService");

exports.getAllBuilds = async (req, res) => {
  const { title, techStack, contributorName, contributorId, type } = req.query;

  if (!validateType(type)) return res.status(400).json({ errorMessage: "Invalid build type" });

  try {
    const userRole = req?.user?.userRole;
    const query = buildService.composeQuery({
      userRole,
      contributorId,
      title,
      techStack,
      contributorName,
    });
    const allBuilds = await buildService.fetchAllBuilds(type, query);
    return res.status(200).json(allBuilds);
  } catch (err) {
    console.error("Error fetching builds:", err);
    return res.status(500).json({ errorMessage: "Failed to fetch builds" });
  }
};

exports.addBuild = async (req, res) => {
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const addedBuild = await buildService.addBuildStatus(type, req.body);
    res.status(201).json({
      message: "Build submitted successfully",
      addedBuild,
    });
  } catch (err) {
    console.error("Error submitting build:", err);
    res.status(500).json({ errorMessage: "Failed to submit build" });
  }
};

exports.deleteBuild = async (req, res) => {
  const { id } = req.params;
  const { contributorName, contributorId, userRole } = req.body;
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const result = await buildService.deleteBuildStatus(type, id, {
      contributorName,
      contributorId,
      userRole,
    });

    res.status(result.status).json({ message: result.message });
  } catch (err) {
    console.error("Error deleting build:", err);
    res.status(err.status || 500).json({ errorMessage: err.message || "Failed to delete build" });
  }
};

exports.updateBuild = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const updatedBuild = await buildService.updateBuildStatus(type, id, req.body);

    res.status(200).json({
      message: "Build updated successfully",
      buildAfterUpdate: updatedBuild,
    });
  } catch (err) {
    console.error("Error updating build:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errorMessage: messages.join(", ") });
    }

    res.status(err.status || 500).json({
      errorMessage: err.message || "Failed to update build",
    });
  }
};

exports.reviewBuild = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, suggestion } = req.body;
  const { type } = req.query;
  const { userName, userRole } = req.user;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ errorMessage: "Invalid status value" });
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return res
      .status(400)
      .json({ errorMessage: "Rejection reason is required when status is rejected" });
  }

  if (status === "pending" && !suggestion?.trim()) {
    return res
      .status(400)
      .json({ errorMessage: "Suggestion message is required when status is pending" });
  }

  if (!userName || !userRole) {
    return res.status(401).json({ errorMessage: "Unauthorized: missing user context" });
  }

  if (userRole !== "admin") {
    return res.status(403).json({ errorMessage: "Only admins can review builds" });
  }

  try {
    const reviewedBuild = await buildService.reviewBuildStatus(type, id, {
      status,
      rejectionReason,
      suggestion,
      userName,
      userRole,
    });

    res.status(200).json({
      message: "Build reviewed successfully",
      buildAfterReview: reviewedBuild,
    });
  } catch (err) {
    console.error("Error reviewing build:", err);
    res.status(err.status || 500).json({
      errorMessage: err.message || "Failed to review build",
    });
  }
};

exports.restoreBuild = async (req, res) => {
  const { id } = req.params;
  const { status, restoredReason } = req.body;
  const { type } = req.query;
  const { userName, userRole } = req.user;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  if (status !== "approved") {
    return res.status(400).json({ errorMessage: "Only 'approved' status is allowed for restore" });
  }

  if (!restoredReason?.trim()) {
    return res.status(400).json({ errorMessage: "Restored reason is required" });
  }

  if (!userName || !userRole) {
    return res.status(401).json({ errorMessage: "Unauthorized: missing user context" });
  }

  if (userRole !== "admin") {
    return res.status(403).json({ errorMessage: "Only admins can restore builds" });
  }

  try {
    const restoredBuild = await buildService.restoreBuildStatus(type, id, {
      status,
      restoredReason,
      userName,
      userRole,
    });

    res.status(200).json({
      message: "Build restored successfully",
      buildAfterRestored: restoredBuild,
    });
  } catch (err) {
    console.error("Error restoring build:", err);
    res.status(err.status || 500).json({ errorMessage: err.message || "Failed to restore build" });
  }
};
