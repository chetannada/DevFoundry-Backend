const { getModelByType } = require("../utils/buildType");
const { fieldMap } = require("../utils/constants");

exports.composeQuery = ({
  userRole,
  contributorId,
  title,
  techStack,
  contributorName,
  statusFilters = [],
}) => {
  const isAdmin = userRole === "admin";
  const isContributor = userRole === "contributor";

  const query = {};

  // Role-based base query
  if (isAdmin) {
    query[fieldMap.status] = { $in: ["approved", "pending", "rejected"] };
  } else if (isContributor) {
    query[fieldMap.isDeleted] = false;
    query.$or = [
      { [fieldMap.status]: "approved" },
      ...(contributorId
        ? [
            {
              [fieldMap.status]: { $in: ["pending", "rejected"] },
              [fieldMap.contributorId]: Number(contributorId),
            },
          ]
        : []),
    ];
  } else {
    query[fieldMap.isDeleted] = false;
    query[fieldMap.status] = "approved";
  }

  // Apply status filters if provided
  if (statusFilters.length) {
    query[fieldMap.status] = { $in: statusFilters };
  }

  // Apply search filters
  const andFilters = [];
  if (title) andFilters.push({ [fieldMap.title]: { $regex: title, $options: "i" } });
  if (techStack) andFilters.push({ [fieldMap.techStack]: { $regex: techStack, $options: "i" } });
  if (contributorName)
    andFilters.push({ [fieldMap.contributorName]: { $regex: contributorName, $options: "i" } });

  if (andFilters.length) query.$and = andFilters;

  return query;
};

exports.fetchAllBuilds = async (type, query) => {
  const Model = getModelByType(type);
  return await Model.find(query).sort({ updatedAt: -1 });
};

exports.addBuildStatus = async (type, data) => {
  const {
    title,
    description,
    repoUrl,
    liveUrl,
    contributorName,
    contributorAvatarUrl,
    contributorProfileUrl,
    contributorRole,
    contributorId,
    techStack,
  } = data;

  if (
    !title ||
    !description ||
    !repoUrl ||
    !liveUrl ||
    !contributorName ||
    !contributorAvatarUrl ||
    !contributorProfileUrl ||
    !contributorRole ||
    !contributorId
  ) {
    throw new Error("Missing required fields");
  }

  const stack = Array.isArray(techStack)
    ? [...new Set(techStack.map(item => item.trim().toLowerCase()))]
    : [];

  const FinalModel = getModelByType(type);

  const newBuild = new FinalModel({
    build: {
      title,
      description,
      repoUrl,
      liveUrl,
      techStack: stack,
      status: "pending",
      submittedAt: new Date(),
    },
    contributor: {
      id: contributorId,
      name: contributorName,
      avatarUrl: contributorAvatarUrl,
      profileUrl: contributorProfileUrl,
      role: contributorRole,
    },
    updated: {
      by: null,
      byRole: null,
      at: null,
    },
    deleted: {
      by: null,
      byRole: null,
      at: null,
      isDeleted: false,
    },
    reviewed: {
      by: null,
      byRole: null,
      at: null,
      rejectionReason: null,
      suggestion: null,
    },
    restored: {
      by: null,
      byRole: null,
      at: null,
      reason: null,
    },
  });

  return await newBuild.save();
};

exports.deleteBuildStatus = async (type, id, { contributorName, contributorId, userRole }) => {
  const FinalModel = getModelByType(type);
  const existingBuild = await FinalModel.findById(id);

  if (!existingBuild) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  const isContributor = existingBuild.contributor?.id === Number(contributorId);
  const isAdmin = userRole === "admin";
  const isApproved = existingBuild.build?.status === "approved";

  if (!isContributor && !isAdmin) {
    const error = new Error("Unauthorized to delete this build");
    error.status = 403;
    throw error;
  }

  if (isAdmin || !isApproved) {
    await FinalModel.findByIdAndDelete(id);
    return { status: 200, message: "Build permanently deleted" };
  } else {
    existingBuild.deleted = {
      by: contributorName,
      byRole: userRole,
      at: new Date(),
      isDeleted: true,
    };

    await existingBuild.save();
    return { status: 200, message: "Build deleted successfully" };
  }
};

exports.updateBuildStatus = async (type, id, data) => {
  const {
    title,
    description,
    repoUrl,
    liveUrl,
    techStack,
    contributorName,
    contributorAvatarUrl,
    contributorProfileUrl,
    contributorRole,
    contributorId,
    updatedBy,
    updatedByRole,
  } = data;

  const FinalModel = getModelByType(type);
  const existingBuild = await FinalModel.findById(id);

  if (!existingBuild) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  if (existingBuild.contributor?.id !== Number(contributorId)) {
    const error = new Error("Unauthorized to update this build");
    error.status = 403;
    throw error;
  }

  const stack = Array.isArray(techStack)
    ? [...new Set(techStack.map(item => item.trim().toLowerCase()))]
    : [];

  // Update nested build info
  existingBuild.build.title = title ?? existingBuild.build.title;
  existingBuild.build.description = description ?? existingBuild.build.description;
  existingBuild.build.repoUrl = repoUrl ?? existingBuild.build.repoUrl;
  existingBuild.build.liveUrl = liveUrl ?? existingBuild.build.liveUrl;
  existingBuild.build.techStack = stack.length ? stack : existingBuild.build.techStack;
  existingBuild.build.status = "pending";

  // Update contributor info
  existingBuild.contributor.name = contributorName ?? existingBuild.contributor.name;
  existingBuild.contributor.avatarUrl = contributorAvatarUrl ?? existingBuild.contributor.avatarUrl;
  existingBuild.contributor.profileUrl =
    contributorProfileUrl ?? existingBuild.contributor.profileUrl;
  existingBuild.contributor.role = contributorRole ?? existingBuild.contributor.role;

  // Update metadata
  existingBuild.updated = {
    by: updatedBy || "system",
    byRole: updatedByRole || "contributor",
    at: new Date(),
  };

  existingBuild.reviewed.rejectionReason = null;
  existingBuild.reviewed.suggestion = null;
  existingBuild.restored.reason = null;

  return await existingBuild.save();
};

exports.reviewBuildStatus = async (
  type,
  id,
  { status, rejectionReason, suggestion, userName, userRole }
) => {
  const FinalModel = getModelByType(type);
  const existingBuild = await FinalModel.findById(id);

  if (!existingBuild) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    const error = new Error("Rejection reason is required when status is 'rejected'.");
    error.status = 400;
    throw error;
  }

  if (status === "pending" && !suggestion?.trim()) {
    const error = new Error("Suggestion message is required when status is 'pending'.");
    error.status = 400;
    throw error;
  }

  existingBuild.build.status = status;

  existingBuild.reviewed = {
    by: userName,
    byRole: userRole,
    at: new Date(),
    rejectionReason: status === "rejected" ? rejectionReason?.trim() : null,
    suggestion: status === "pending" ? suggestion?.trim() : null,
  };

  existingBuild.restored.reason = null;

  return await existingBuild.save();
};

exports.restoreBuildStatus = async (type, id, { status, restoredReason, userName, userRole }) => {
  const FinalModel = getModelByType(type);
  const existingBuild = await FinalModel.findById(id);

  if (!existingBuild) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  existingBuild.build.status = status || "approved";

  existingBuild.restored = {
    by: userName,
    byRole: userRole,
    at: new Date(),
    reason: restoredReason ? restoredReason?.trim() : null,
  };

  existingBuild.reviewed.rejectionReason = null;
  existingBuild.reviewed.suggestion = null;
  existingBuild.deleted.isDeleted = false;

  return await existingBuild.save();
};

exports.toggleFavoriteBuild = async ({ user, buildId, buildType }) => {
  const alreadyFavorited = user.favorites?.some(f => f.buildId.toString() === buildId);

  if (alreadyFavorited) {
    user.favorites = user.favorites.filter(f => f.buildId.toString() !== buildId);
  } else {
    user.favorites.push({ buildId, buildType });
  }

  await user.save();

  return {
    success: true,
    message: alreadyFavorited ? "Build removed from favorites" : "Build added to favorites",
    buildId,
    buildType,
    isFavorited: !alreadyFavorited,
  };
};
