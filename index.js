const express = require("express");
const axios = require("axios");
const dotenvFlow = require("dotenv-flow");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createToken } = require("./utils/jwt");
const authenticateUser = require("./middleware/auth");

// dotenv-flow is used to manage environment variables across different environments
dotenvFlow.config();

const app = express();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const REACT_APP_URL = process.env.REACT_APP_URL;
const REACT_LOCAL_URL = process.env.REACT_LOCAL_URL;
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// CORS middleware - Always handle credentials + preflight
const allowedOrigin = isProduction ? REACT_APP_URL : REACT_LOCAL_URL;
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight explicitly
app.options(
  "*",
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// allow us to parse cookies from the request, this is needed for session management
app.use(cookieParser());

// app will serve and receive data in a JSON format
app.use(express.json());

// trust first proxy for secure cookies in production
if (isProduction) {
  app.set("trust proxy", 1);
}

// Step 1: Redirect to GitHub
app.get("/auth/github", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}`;
  res.redirect(redirectUrl);
});

// Step 2: GitHub redirects back
app.get("/auth/github/callback", async (req, res) => {
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

    const jwtToken = createToken(userPayload);

    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.redirect(isProduction ? REACT_APP_URL : REACT_LOCAL_URL);
  } catch (err) {
    console.error(err);
    res.status(500).send("Authentication failed");
  }
});

// Step 3: Check if user is logged in
app.get("/api/me", authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

// Step 4: For Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.json({ message: "User Successfully Logged out" });
});

// Step 5: Test route
app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to React.js Project Server</h1><p>See Live Web URL for this Server - <a href="https://reactjs-projects-app.netlify.app">https://reactjs-projects-app.netlify.app</a></p>`
  );
});

// Only start the HTTP server if this file was run directly with `node index.js`
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

module.exports = app;
