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
