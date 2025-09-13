const { CoreBuilds, CommunityBuilds } = require("../database/models/buildsModel");

function getModelByType(type) {
  return type === "core" ? CoreBuilds : CommunityBuilds;
}

function validateType(type) {
  return ["core", "community"].includes(type);
}

// Get all builds
exports.getAllBuilds = async (req, res) => {
  const { title, techStack, contributorName, contributorId, type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const isAdmin = req?.user?.userRole === "admin";
    const isContributor = req?.user?.userRole === "contributor";

    let query = {};

    if (isAdmin) {
      // Admin sees all builds
      query.status = {
        $in: ["approved", "pending", "rejected"],
      };
    } else if (isContributor) {
      // Contributors see only approved + their own pending/rejected
      query.isDeleted = false;
      query.$or = [
        { status: "approved" },
        ...(contributorId
          ? [
              {
                status: { $in: ["pending", "rejected"] },
                contributorId: Number(contributorId),
              },
            ]
          : []),
      ];
    } else {
      // Guest user — only show approved builds
      query.isDeleted = false;
      query.status = "approved";
    }

    const andFilters = [];

    if (title) {
      andFilters.push({
        title: { $regex: title, $options: "i" },
      });
    }

    if (techStack) {
      andFilters.push({
        techStack: { $regex: techStack, $options: "i" },
      });
    }

    if (contributorName) {
      andFilters.push({
        contributorName: { $regex: contributorName, $options: "i" },
      });
    }

    if (andFilters.length) {
      query.$and = andFilters;
    }

    const FinalModel = getModelByType(type);
    const allBuilds = await FinalModel.find(query).sort({ updatedAt: -1 });

    res.status(200).json(allBuilds);
  } catch (err) {
    console.error("Error fetching builds:", err);
    res.status(500).json({ errorMessage: "Failed to fetch builds" });
  }
};

// Add a new build
exports.addBuild = async (req, res) => {
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const {
      title,
      description,
      codeUrl,
      liveUrl,
      contributorName,
      contributorAvatarUrl,
      contributorGithubUrl,
      contributorRole,
      contributorId,
      techStack,
    } = req.body;

    if (
      !title ||
      !description ||
      !codeUrl ||
      !liveUrl ||
      !contributorName ||
      !contributorAvatarUrl ||
      !contributorGithubUrl ||
      !contributorRole ||
      !contributorId
    ) {
      return res.status(400).json({ errorMessage: "Missing required fields" });
    }

    const stack = Array.isArray(techStack) ? [...new Set(techStack.map(item => item.trim()))] : [];

    const FinalModel = getModelByType(type);

    const newBuild = new FinalModel({
      title,
      description,
      codeUrl,
      liveUrl,
      contributorName,
      contributorId,
      contributorAvatarUrl,
      contributorGithubUrl,
      contributorRole,
      techStack: stack,
      submittedAt: new Date(),
    });

    const addedBuild = await newBuild.save();

    res.status(201).json({ message: "Build submitted successfully", addedBuild });
  } catch (err) {
    console.error("Error submitting build:", err);
    res.status(500).json({ errorMessage: "Failed to submit build" });
  }
};

// Delete a build by ID
exports.deleteBuild = async (req, res) => {
  const { id } = req.params;
  const { contributorName, contributorId, userRole } = req.body;
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const FinalModel = getModelByType(type);
    const build = await FinalModel.findById(id);

    if (!build) {
      return res.status(404).json({ errorMessage: "Build not found" });
    }

    const isContributor = build.contributorId === Number(contributorId);
    const isAdmin = userRole === "admin";

    if (!isContributor && !isAdmin) {
      return res.status(403).json({ errorMessage: "Unauthorized to delete this build" });
    }

    if (isAdmin) {
      await FinalModel.findByIdAndDelete(id);
      return res.status(200).json({ message: "Build permanently deleted by admin" });
    } else {
      build.isDeleted = true;
      build.deletedAt = new Date();
      build.deletedBy = contributorName;
      build.deletedByRole = userRole;

      await build.save();
      return res.status(200).json({ message: "Build deleted successfully" });
    }
  } catch (err) {
    console.error("Error deleting build:", err);
    res.status(500).json({ errorMessage: "Failed to delete build" });
  }
};

// Update a build by ID
exports.updateBuild = async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    codeUrl,
    liveUrl,
    contributorName,
    contributorAvatarUrl,
    contributorGithubUrl,
    contributorRole,
    contributorId,
    techStack,
    updatedBy,
    updatedByRole,
    rejectionReason,
    restoredReason,
  } = req.body;

  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  try {
    const FinalModel = getModelByType(type);
    const existingBuild = await FinalModel.findById(id);

    if (!existingBuild) {
      return res.status(404).json({ errorMessage: "Build not found" });
    }

    if (existingBuild.contributorId !== Number(contributorId)) {
      return res.status(403).json({ errorMessage: "Unauthorized to update this build" });
    }

    const stack = Array.isArray(techStack) ? [...new Set(techStack.map(item => item.trim()))] : [];

    existingBuild.title = title ?? existingBuild.title;
    existingBuild.description = description ?? existingBuild.description;
    existingBuild.codeUrl = codeUrl ?? existingBuild.codeUrl;
    existingBuild.liveUrl = liveUrl ?? existingBuild.liveUrl;
    existingBuild.contributorName = contributorName ?? existingBuild.contributorName;
    existingBuild.contributorAvatarUrl = contributorAvatarUrl ?? existingBuild.contributorAvatarUrl;
    existingBuild.contributorGithubUrl = contributorGithubUrl ?? existingBuild.contributorGithubUrl;
    existingBuild.contributorRole = contributorRole ?? existingBuild.contributorRole;
    existingBuild.techStack = stack.length ? stack : existingBuild.techStack;
    existingBuild.updatedBy = updatedBy || "Unknown";
    existingBuild.updatedByRole = updatedByRole || "contributor";
    existingBuild.updatedAt = new Date();
    existingBuild.rejectionReason = rejectionReason ?? existingBuild.rejectionReason;
    existingBuild.restoredReason = restoredReason ?? existingBuild.restoredReason;
    existingBuild.status = "pending";

    const buildAfterUpdate = await existingBuild.save();

    res.status(200).json({ message: "Build updated successfully", buildAfterUpdate });
  } catch (err) {
    console.error("Error updating build:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errorMessage: messages.join(", ") });
    }

    res.status(500).json({ errorMessage: "Failed to update build" });
  }
};

// Review a build by ID
exports.reviewBuild = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const { type } = req.query;
  const { userName, userRole } = req.user;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid build type" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ errorMessage: "Invalid status value" });
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return res
      .status(400)
      .json({ errorMessage: "Rejection reason is required when status is rejected" });
  }

  if (!userName || !userRole) {
    return res.status(401).json({ errorMessage: "Unauthorized: missing user context" });
  }

  if (userRole !== "admin") {
    return res.status(403).json({ errorMessage: "Only admins can review builds" });
  }

  try {
    const FinalModel = getModelByType(type);
    const build = await FinalModel.findById(id);

    if (!build) {
      return res.status(404).json({ errorMessage: "Build not found" });
    }

    build.status = status;
    build.reviewedBy = userName;
    build.reviewedByRole = userRole;
    build.reviewedAt = new Date();
    build.rejectionReason = status === "rejected" ? rejectionReason.trim() : null;

    const buildAfterReview = await build.save();
    res.status(200).json({ message: "Build reviewed successfully", buildAfterReview });
  } catch (err) {
    console.error("Error reviewing build:", err);
    res.status(500).json({ errorMessage: "Failed to review build" });
  }
};

// Restore a build by ID
exports.restoreBuild = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, restoredReason } = req.body;
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
    const FinalModel = getModelByType(type);
    const build = await FinalModel.findById(id);

    if (!build) {
      return res.status(404).json({ errorMessage: "Build not found" });
    }

    build.status = status;
    build.restoredBy = userName;
    build.restoredByRole = userRole;
    build.restoredAt = new Date();
    build.restoredReason = restoredReason.trim();
    build.rejectionReason = rejectionReason;
    build.isDeleted = false;

    const buildAfterRestored = await build.save();
    res.status(200).json({ message: "Build restored successfully", buildAfterRestored });
  } catch (err) {
    console.error("Error restoring build:", err);
    res.status(500).json({ errorMessage: "Failed to restore build" });
  }
};
