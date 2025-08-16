const axios = require("axios");
const { generateToken } = require("../utils/jwt");
const { sendError } = require("../utils/error");

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const REACT_APP_URL = process.env.REACT_APP_URL;
const REACT_LOCAL_URL = process.env.REACT_LOCAL_URL;
const isProduction = process.env.NODE_ENV === "production";

// Base route to welcome users
exports.baseRoot = (req, res) => {
  res.send(
    `<h1>Welcome to React.js Project Server</h1><p>See Live Web URL for this Server - <a href="https://reactjs-projects-app.netlify.app">https://reactjs-projects-app.netlify.app</a></p>`
  );
};

// Redirect to GitHub for authentication
exports.githubRedirect = (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}`;
  res.redirect(redirectUrl);
};

// Handle GitHub callback and exchange code for access token
exports.githubCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userRes.data;

    const userPayload = {
      userId: userData.id,
      userLogin: userData.login,
      userName: userData.name,
      userAvatarUrl: userData.avatar_url,
    };

    const jwtToken = generateToken(userPayload);

    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.redirect(isProduction ? REACT_APP_URL : REACT_LOCAL_URL);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Authentication failed. Please try again.");
  }
};

// Get the authenticated user's information
exports.getMe = (req, res) => {
  res.json({ user: req.user });
};

// Logout the user by clearing the authentication cookie
exports.logout = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.json({ message: "User Successfully Logged out" });
};
