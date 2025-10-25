const axios = require("axios");
const { sendError } = require("../utils/error");

const getUserRepos = async (req, res) => {
  const accessToken = req.cookies.github_token;

  const { visibility, affiliation, pageSize } = req.query;

  if (!accessToken) {
    return sendError(res, 401, "GitHub token missing. Please re-authenticate.");
  }

  try {
    const response = await axios.get(
      `https://api.github.com/user/repos?visibility=${visibility}&affiliation=${affiliation}&per_page=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
    }));

    res.json(repos);
  } catch (err) {
    console.error("GitHub repo fetch failed:", err.response?.data || err.message);
    sendError(res, 500, "Failed to fetch GitHub repositories.");
  }
};

module.exports = getUserRepos;
