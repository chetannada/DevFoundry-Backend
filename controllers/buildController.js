const { getModelByType, validateType } = require("../utils/buildType");
const buildService = require("../services/buildService");
const UserModel = require("../database/models/userModel");
const { sendError } = require("../utils/error");

exports.getAllBuilds = async (req, res) => {
  const {
    title,
    techStack,
    contributorName,
    contributorId,
    type,
    favorite,
    pending,
    approved,
    rejected,
  } = req.query;

  if (!validateType(type)) {
    return sendError(res, 400, "Invalid build type");
  }

  try {
    const userRole = req?.user?.userRole;
    const userId = req?.user?._id;

    // Collect status filters
    const statusFilters = [];
    if (pending === "true") statusFilters.push("pending");
    if (approved === "true") statusFilters.push("approved");
    if (rejected === "true") statusFilters.push("rejected");

    // Compose query with status filters
    const query = buildService.composeQuery({
      userRole,
      contributorId,
      title,
      techStack,
      contributorName,
      statusFilters,
    });

    const allBuilds = await buildService.fetchAllBuilds(type, query);

    // Get user's favorite build IDs
    let favoriteIds = [];
    if (userId) {
      const user = await UserModel.findById(userId);
      favoriteIds = (user?.favorites ?? [])
        .filter(f => f.buildType === type)
        .map(f => f.buildId.toString());
    }

    // Attach isFavorited flag
    const buildsWithFavoriteFlag = allBuilds.map(build => ({
      ...build.toObject(),
      isFavorited: favoriteIds.includes(build._id.toString()),
    }));

    // Filter by favorite if requested
    const finalBuilds =
      favorite === "true"
        ? buildsWithFavoriteFlag.filter(b => b.isFavorited)
        : buildsWithFavoriteFlag;

    return res.status(200).json(finalBuilds);
  } catch (err) {
    console.error("Error fetching builds:", err);
    return sendError(res, 500, "Failed to fetch builds");
  }
};

exports.addBuild = async (req, res) => {
  const { type } = req.query;

  if (!validateType(type)) {
    return sendError(res, 400, "Invalid build type");
  }

  try {
    const addedBuild = await buildService.addBuildStatus(type, req.body);
    res.status(201).json({
      displayMessage: "Build submitted successfully",
      addedBuild,
    });
  } catch (err) {
    console.error("Error submitting build:", err);
    return sendError(res, 500, "Failed to submit build");
  }
};

exports.deleteBuild = async (req, res) => {
  const { id } = req.params;
  const { contributorName, contributorId, userRole } = req.body;
  const { type } = req.query;

  if (!validateType(type)) {
    return sendError(res, 400, "Invalid build type");
  }

  try {
    const result = await buildService.deleteBuildStatus(type, id, {
      contributorName,
      contributorId,
      userRole,
    });

    res.status(result.status).json({ displayMessage: result.displayMessage });
  } catch (err) {
    console.error("Error deleting build:", err);
    return sendError(res, err.status || 500, err.displayMessage || "Failed to delete build");
  }
};

exports.updateBuild = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (!validateType(type)) {
    return sendError(res, 400, "Invalid build type");
  }

  try {
    const updatedBuild = await buildService.updateBuildStatus(type, id, req.body);

    res.status(200).json({
      displayMessage: "Build updated successfully",
      buildAfterUpdate: updatedBuild,
    });
  } catch (err) {
    console.error("Error updating build:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return sendError(res, 400, messages.join(", "));
    }

    return sendError(res, err.status || 500, err.displayMessage || "Failed to update build");
  }
};

exports.reviewBuild = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, suggestion } = req.body;
  const { type } = req.query;
  const { userName, userRole } = req.user;

  if (!validateType(type)) {
    return sendError(res, 400, "Invalid build type");
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return sendError(res, 400, "Invalid status value");
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return sendError(res, 400, "Rejection reason is required when status is rejected");
  }

  if (status === "pending" && !suggestion?.trim()) {
    return sendError(res, 400, "Suggestion message is required when status is pending");
  }

  if (!userName || !userRole) {
    return sendError(res, 401, "Unauthorized: missing user context");
  }

  if (userRole !== "admin") {
    return sendError(res, 403, "Only admins can review builds");
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
      displayMessage: "Build reviewed successfully",
      buildAfterReview: reviewedBuild,
    });
  } catch (err) {
    console.error("Error reviewing build:", err);
    return sendError(res, err.status || 500, err.displayMessage || "Failed to review build");
  }
};

exports.restoreBuild = async (req, res) => {
  const { id } = req.params;
  const { status, restoredReason } = req.body;
  const { type } = req.query;
  const { userName, userRole } = req.user;

  if (!validateType(type)) {
    return sendError(res, 400, "Invalid build type");
  }

  if (status !== "approved") {
    return sendError(res, 400, "Only 'approved' status is allowed for restore");
  }

  if (!restoredReason?.trim()) {
    return sendError(res, 400, "Restored reason is required");
  }

  if (!userName || !userRole) {
    return sendError(res, 401, "Unauthorized: missing user context");
  }

  if (userRole !== "admin") {
    return sendError(res, 403, "Only admins can restore builds");
  }

  try {
    const restoredBuild = await buildService.restoreBuildStatus(type, id, {
      status,
      restoredReason,
      userName,
      userRole,
    });

    res.status(200).json({
      displayMessage: "Build restored successfully",
      buildAfterRestored: restoredBuild,
    });
  } catch (err) {
    console.error("Error restoring build:", err);
    return sendError(res, err.status || 500, err.displayMessage || "Failed to restore build");
  }
};

exports.favoriteBuild = async (req, res) => {
  const { buildId } = req.params;
  const { buildType } = req.body;
  const user = req.user;

  if (!buildType || !["core", "community"].includes(buildType)) {
    return sendError(res, 400, "Invalid or missing buildType");
  }

  try {
    const result = await buildService.toggleFavoriteBuild({ user, buildId, buildType });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error toggling favorite:", err);
    return sendError(res, 500, "Failed to toggle favorite");
  }
};
