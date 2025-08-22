# 🚀 ReactJs-Projects-Backend

A robust Node.js + Express backend powering the [ReactJs Projects frontend](https://reactjs-projects-app.netlify.app/). This API handles project data, user authentication via GitHub, and supports scalable deployment with environment separation.

🔗 **Live API**: [reactjs-projects-api.vercel.app](https://reactjs-projects-api.vercel.app/)  
📦 **Frontend Repo**: [ReactJs Projects App](https://github.com/chetannada/ReactJs-Projects)

## 🛠️ Tech Stack

### Backend

- **Node.js** – Runtime environment
- **Express.js** – Web framework for RESTful APIs
- **MongoDB** – NoSQL database
- **Mongoose** – ODM for MongoDB
- **JWT** – Authentication via JSON Web Tokens
- **GitHub OAuth** – Secure login via GitHub

### Deployment

- **Vercel** – Serverless deployment

## 🔐 Authentication Flow

- GitHub OAuth login
- JWT token generation and verification
- Protected routes via middleware
- Role-based access support (admin/contributor)

## 📦 API Endpoints

### 🔧 Crafted Projects

| Method | Endpoint                           | Description                                  |
| ------ | ---------------------------------- | -------------------------------------------- |
| GET    | `/api/projects/crafted/get`        | Fetch all crafted projects                   |
| POST   | `/api/projects/crafted/add`        | Add a new crafted project (auth required)    |
| PUT    | `/api/projects/crafted/update/:id` | Update crafted project by ID (auth required) |
| DELETE | `/api/projects/crafted/delete/:id` | Delete crafted project by ID (auth required) |

### 🔐 Authentication

| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| GET    | `/auth/github`   | Initiate GitHub login |
| GET    | `/auth/callback` | GitHub OAuth callback |

## 🌱 Structure of this Project

```bash
/ReactJs-Projects-Backend

├── api/                           # Entry point for API routing
│ └── index.js
├── controllers/                   # Business logic for auth and project routes
│ ├── authController.js
│ └── projectsController.js
├── middleware/                    # Auth middleware for route protection
│ └── auth.js
├── models/                        # Mongoose schemas for MongoDB
│ ├── authUserModel.js
│ └── projectsModel.js
├── routes/                        # Route definitions and grouping
│ ├── authRoutes.js
│ ├── index.js
│ └── projectsRoutes.js
├── utils/                         # Shared utilities (JWT, error handling)
│ ├── error.js
│ └── jwt.js
├── .env                           # Environment variables (fill actual values)
├── index.js                       # App entry point
└── README.md                  # Project documentation

```

## 🔥 Clone this Repository

You need to write the following commands on the terminal screen (in vscode) so that you can run this project locally.

```bash
git clone "https://github.com/chetannada/ReactJs-Projects-Backend.git"
```

Go to the project directory

```bash
cd ReactJs-Projects-Backend
```

Install dependencies

```bash
npm install
```

Set up environment variables:

- .env - environment variables for this project to run in development environment (fill with actual values for environment variables)

Run the server:

```bash
npm run start
```

This server should now be running on `http://localhost:5000`.

If you want to Fork repository and want to run locally, follow this guidelines [Fork and Clone Github Repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo)

## ✏️ Contributing

Pull requests are welcome! If you’d like to add features, improve error handling, or optimize performance, feel free to fork and submit a PR.

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/license/MIT).

## 🤝 Let's Connect

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/chetannada/)
[![twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/chetannada)
[![discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discordapp.com/users/916005177838956555)
