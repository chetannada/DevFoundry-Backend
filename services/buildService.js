const { getModelByType } = require("../utils/buildType");

exports.composeQuery = ({ userRole, contributorId, title, techStack, contributorName }) => {
  const isAdmin = userRole === "admin";
  const isContributor = userRole === "contributor";

  let query = {};

  if (isAdmin) {
    query.status = { $in: ["approved", "pending", "rejected"] };
  } else if (isContributor) {
    query.isDeleted = false;
    query.$or = [
      { status: "approved" },
      ...(contributorId
        ? [{ status: { $in: ["pending", "rejected"] }, contributorId: Number(contributorId) }]
        : []),
    ];
  } else {
    query.isDeleted = false;
    query.status = "approved";
  }

  const andFilters = [];
  if (title) andFilters.push({ title: { $regex: title, $options: "i" } });
  if (techStack) andFilters.push({ techStack: { $regex: techStack, $options: "i" } });
  if (contributorName)
    andFilters.push({ contributorName: { $regex: contributorName, $options: "i" } });
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
    contributorGithubUrl,
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
    !contributorGithubUrl ||
    !contributorRole ||
    !contributorId
  ) {
    throw new Error("Missing required fields");
  }

  const stack = Array.isArray(techStack) ? [...new Set(techStack.map(item => item.trim()))] : [];

  const FinalModel = getModelByType(type);

  const newBuild = new FinalModel({
    title,
    description,
    repoUrl,
    liveUrl,
    contributorName,
    contributorId,
    contributorAvatarUrl,
    contributorGithubUrl,
    contributorRole,
    techStack: stack,
    submittedAt: new Date(),
  });

  return await newBuild.save();
};

exports.deleteBuildStatus = async (type, id, { contributorName, contributorId, userRole }) => {
  const FinalModel = getModelByType(type);
  const build = await FinalModel.findById(id);

  if (!build) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  const isContributor = build.contributorId === Number(contributorId);
  const isAdmin = userRole === "admin";

  if (!isContributor && !isAdmin) {
    const error = new Error("Unauthorized to delete this build");
    error.status = 403;
    throw error;
  }

  if (isAdmin) {
    await FinalModel.findByIdAndDelete(id);
    return { status: 200, message: "Build permanently deleted by admin" };
  } else {
    build.isDeleted = true;
    build.deletedAt = new Date();
    build.deletedBy = contributorName;
    build.deletedByRole = userRole;

    await build.save();
    return { status: 200, message: "Build deleted successfully" };
  }
};

exports.updateBuildStatus = async (type, id, data) => {
  const {
    title,
    description,
    repoUrl,
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
  } = data;

  const FinalModel = getModelByType(type);
  const existingBuild = await FinalModel.findById(id);

  if (!existingBuild) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  if (existingBuild.contributorId !== Number(contributorId)) {
    const error = new Error("Unauthorized to update this build");
    error.status = 403;
    throw error;
  }

  const stack = Array.isArray(techStack) ? [...new Set(techStack.map(item => item.trim()))] : [];

  existingBuild.title = title ?? existingBuild.title;
  existingBuild.description = description ?? existingBuild.description;
  existingBuild.repoUrl = repoUrl ?? existingBuild.repoUrl;
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

  return await existingBuild.save();
};

exports.reviewBuildStatus = async (type, id, { status, rejectionReason, userName, userRole }) => {
  const FinalModel = getModelByType(type);
  const build = await FinalModel.findById(id);

  if (!build) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  build.status = status;
  build.reviewedBy = userName;
  build.reviewedByRole = userRole;
  build.reviewedAt = new Date();
  build.rejectionReason = status === "rejected" ? rejectionReason.trim() : null;

  return await build.save();
};

exports.restoreBuildStatus = async (
  type,
  id,
  { status, rejectionReason, restoredReason, userName, userRole }
) => {
  const FinalModel = getModelByType(type);
  const build = await FinalModel.findById(id);

  if (!build) {
    const error = new Error("Build not found");
    error.status = 404;
    throw error;
  }

  build.status = status;
  build.restoredBy = userName;
  build.restoredByRole = userRole;
  build.restoredAt = new Date();
  build.restoredReason = restoredReason.trim();
  build.rejectionReason = rejectionReason;
  build.isDeleted = false;

  return await build.save();
};
