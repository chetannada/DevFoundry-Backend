const Project = require("../models/projectsModel");

// GET all projects
exports.getAllCraftedProjects = async (req, res) => {
  const { projectTitle, contributorId } = req.query;

  try {
    let query = {
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
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
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
      return res.status(400).json({ error: "Missing required fields" });
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
      isApproved: false,
      techStack: stack,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: new Date(),
      rejectionReason: null,
    });

    const savedProject = await newProject.save();
    res
      .status(201)
      .json({ message: "Project submitted successfully", savedProject });
  } catch (err) {
    console.error("Error submitting project:", err);
    res.status(500).json({ error: "Failed to submit project" });
  }
};

// Delete a project by ID
exports.deleteCraftedProject = async (req, res) => {
  const { id } = req.params;
  const { contributorId } = req.body;

  const getProject = await Project.findById(id);
  if (!getProject || getProject.contributorId !== Number(contributorId)) {
    return res
      .status(403)
      .json({ error: "Unauthorized to delete this project" });
  }

  try {
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully", deletedProject });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
