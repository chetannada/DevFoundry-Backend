const Project = require("../models/projectsModel");

// GET all projects
exports.getAllCraftedProjects = async (req, res) => {
  const { projectTitle } = req.query;

  try {
    let query = {};

    if (projectTitle) {
      query.projectTitle = { $regex: projectTitle, $options: "i" };
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
    } = req.body;

    if (
      !projectTitle ||
      !projectDescription ||
      !githubCodeUrl ||
      !liveUrl ||
      !contributorName ||
      !contributorAvatarUrl ||
      !contributorGithubUrl ||
      !contributorRole
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProject = new Project({
      projectTitle,
      projectDescription,
      githubCodeUrl,
      liveUrl,
      contributorName,
      contributorAvatarUrl,
      contributorGithubUrl,
      contributorRole: contributorRole,
      isApproved: false,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: new Date(),
      rejectionReason: null,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Error submitting project:", err);
    res.status(500).json({ error: "Failed to submit project" });
  }
};
