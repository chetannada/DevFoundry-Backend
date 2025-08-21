const Project = require("../models/projectsModel");

// Get all projects
exports.getAllCraftedProjects = async (req, res) => {
  const { projectTitle, contributorId } = req.query;

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

    const projects = await Project.find(query).sort({ updatedAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ errorMessage: "Failed to fetch projects" });
  }
};

// Add a new project
exports.addCraftedProject = async (req, res) => {
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
      ? [...new Set(techStack.map((item) => item.trim()))].slice(0, 4)
      : [];

    const newProject = new Project({
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
    res
      .status(201)
      .json({ message: "Project submitted successfully", savedProject });
  } catch (err) {
    console.error("Error submitting project:", err);
    res.status(500).json({ errorMessage: "Failed to submit project" });
  }
};

// Delete a project by ID
exports.deleteCraftedProject = async (req, res) => {
  const { id } = req.params;
  const { contributorId, userRole } = req.body;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ errorMessage: "Project not found" });
    }

    const isContributor = project.contributorId === Number(contributorId);
    const isAdmin = userRole === "admin";

    if (!isContributor && !isAdmin) {
      return res
        .status(403)
        .json({ errorMessage: "Unauthorized to delete this project" });
    }

    if (isAdmin) {
      await Project.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: "Project permanently deleted by admin" });
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
exports.updateCraftedProject = async (req, res) => {
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

  try {
    const existingProject = await Project.findById(id);

    if (!existingProject) {
      return res.status(404).json({ errorMessage: "Project not found" });
    }

    if (existingProject.contributorId !== Number(contributorId)) {
      return res
        .status(403)
        .json({ errorMessage: "Unauthorized to update this project" });
    }

    const stack = Array.isArray(techStack)
      ? [...new Set(techStack.map((item) => item.trim()))].slice(0, 4)
      : [];

    existingProject.projectTitle = projectTitle ?? existingProject.projectTitle;
    existingProject.projectDescription =
      projectDescription ?? existingProject.projectDescription;
    existingProject.githubCodeUrl =
      githubCodeUrl ?? existingProject.githubCodeUrl;
    existingProject.liveUrl = liveUrl ?? existingProject.liveUrl;
    existingProject.contributorName =
      contributorName ?? existingProject.contributorName;
    existingProject.contributorAvatarUrl =
      contributorAvatarUrl ?? existingProject.contributorAvatarUrl;
    existingProject.contributorGithubUrl =
      contributorGithubUrl ?? existingProject.contributorGithubUrl;
    existingProject.contributorRole =
      contributorRole ?? existingProject.contributorRole;
    existingProject.techStack = stack.length
      ? stack
      : existingProject.techStack;
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
