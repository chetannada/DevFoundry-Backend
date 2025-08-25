const { CuratedProject, CraftedProject } = require("../models/projectsModel");

function getModelByType(type) {
  return type === "crafted" ? CraftedProject : CuratedProject;
}

function validateType(type) {
  return ["crafted", "curated"].includes(type);
}

// Get all projects
exports.getAllProjects = async (req, res) => {
  const { projectTitle, contributorId, type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid project type" });
  }

  try {
    let query = {
      isDeleted: false,
      $or: [
        { status: "approved" },
        {
          status: { $in: ["pending", "rejected"] },
          contributorId: contributorId ? Number(contributorId) : null,
        },
      ],
    };

    if (projectTitle) {
      query.$and = [
        ...(query.$and || []),
        { projectTitle: { $regex: projectTitle, $options: "i" } },
      ];
    }

    const ProjectModel = getModelByType(type);
    const allprojects = await ProjectModel.find(query).sort({ updatedAt: -1 });

    res.status(200).json(allprojects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ errorMessage: "Failed to fetch projects" });
  }
};

// Add a new project
exports.addProject = async (req, res) => {
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid project type" });
  }

  try {
    const {
      projectTitle,
      projectDescription,
      githubCodeUrl,
      liveUrl,
      contributorName,
      contributorAvatarUrl,
      contributorGithubUrl,
      contributorRole,
      contributorId,
      techStack,
    } = req.body;

    if (
      !projectTitle ||
      !projectDescription ||
      !githubCodeUrl ||
      !liveUrl ||
      !contributorName ||
      !contributorAvatarUrl ||
      !contributorGithubUrl ||
      !contributorRole ||
      !contributorId
    ) {
      return res.status(400).json({ errorMessage: "Missing required fields" });
    }

    const stack = Array.isArray(techStack)
      ? [...new Set(techStack.map(item => item.trim()))].slice(0, 4)
      : [];

    const ProjectModel = getModelByType(type);

    const newProject = new ProjectModel({
      projectTitle,
      projectDescription,
      githubCodeUrl,
      liveUrl,
      contributorName,
      contributorId,
      contributorAvatarUrl,
      contributorGithubUrl,
      contributorRole: contributorRole,
      techStack: stack,
      status: "pending",
      updatedBy: null,
      updatedByRole: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: new Date(),
      rejectionReason: null,
      isDeleted: false,
    });

    const savedProject = await newProject.save();

    res.status(201).json({ message: "Project submitted successfully", savedProject });
  } catch (err) {
    console.error("Error submitting project:", err);
    res.status(500).json({ errorMessage: "Failed to submit project" });
  }
};

// Delete a project by ID
exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const { contributorId, userRole } = req.body;
  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid project type" });
  }

  try {
    const ProjectModel = getModelByType(type);
    const project = await ProjectModel.findById(id);

    if (!project) {
      return res.status(404).json({ errorMessage: "Project not found" });
    }

    const isContributor = project.contributorId === Number(contributorId);
    const isAdmin = userRole === "admin";

    if (!isContributor && !isAdmin) {
      return res.status(403).json({ errorMessage: "Unauthorized to delete this project" });
    }

    if (isAdmin) {
      await ProjectModel.findByIdAndDelete(id);
      return res.status(200).json({ message: "Project permanently deleted by admin" });
    } else {
      project.isDeleted = true;
      await project.save();
      return res.status(200).json({ message: "Project deleted successfully" });
    }
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ errorMessage: "Failed to delete project" });
  }
};

// Update a project by ID
exports.updateProject = async (req, res) => {
  const { id } = req.params;

  const {
    projectTitle,
    projectDescription,
    githubCodeUrl,
    liveUrl,
    contributorName,
    contributorAvatarUrl,
    contributorGithubUrl,
    contributorRole,
    contributorId,
    techStack,
    updatedBy,
    updatedByRole,
  } = req.body;

  const { type } = req.query;

  if (!validateType(type)) {
    return res.status(400).json({ errorMessage: "Invalid project type" });
  }

  try {
    const ProjectModel = getModelByType(type);
    const existingProject = await ProjectModel.findById(id);

    if (!existingProject) {
      return res.status(404).json({ errorMessage: "Project not found" });
    }

    if (existingProject.contributorId !== Number(contributorId)) {
      return res.status(403).json({ errorMessage: "Unauthorized to update this project" });
    }

    const stack = Array.isArray(techStack)
      ? [...new Set(techStack.map(item => item.trim()))].slice(0, 4)
      : [];

    existingProject.projectTitle = projectTitle ?? existingProject.projectTitle;
    existingProject.projectDescription = projectDescription ?? existingProject.projectDescription;
    existingProject.githubCodeUrl = githubCodeUrl ?? existingProject.githubCodeUrl;
    existingProject.liveUrl = liveUrl ?? existingProject.liveUrl;
    existingProject.contributorName = contributorName ?? existingProject.contributorName;
    existingProject.contributorAvatarUrl =
      contributorAvatarUrl ?? existingProject.contributorAvatarUrl;
    existingProject.contributorGithubUrl =
      contributorGithubUrl ?? existingProject.contributorGithubUrl;
    existingProject.contributorRole = contributorRole ?? existingProject.contributorRole;
    existingProject.techStack = stack.length ? stack : existingProject.techStack;
    existingProject.updatedBy = updatedBy || "Unknown";
    existingProject.updatedByRole = updatedByRole || "contributor";
    existingProject.updatedAt = new Date();

    const updatedProject = await existingProject.save();

    res.json({ message: "Project updated successfully", updatedProject });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ errorMessage: "Failed to update project" });
  }
};
