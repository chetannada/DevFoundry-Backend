# 🚀 DevFoundry-Backend

A scalable Node.js + Express.js backend powering the [DevFoundry frontend](https://devfoundry.netlify.app) — _where developers forge their builds_.  
This API handles curated project data, GitHub OAuth login, JWT-based authentication, role-based access control, and contributor-friendly submission workflows.  
Built for modular clarity and production-grade deployment across environments.

🔗 **Live API**: [devfoundry-backend.vercel.app](https://devfoundry.vercel.app)  
📦 **Frontend Repo**: [DevFoundry App](https://github.com/chetannada/DevFoundry)

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

### 🔧 Core/Community Builds

| Method | Endpoint                  | Description                                                     |
| ------ | ------------------------- | --------------------------------------------------------------- |
| GET    | `/api/builds/get`         | Fetch all core/community builds                                 |
| POST   | `/api/builds/add`         | Add a new core/community builds (auth required)                 |
| PUT    | `/api/builds/update/:id`  | Update core/community builds by ID (auth required)              |
| DELETE | `/api/builds/delete/:id`  | Delete core/community builds by ID (auth required)              |
| PUT    | `/api/builds/review/:id`  | Review and update status of a core/community build (admin only) |
| PUT    | `/api/builds/restore/:id` | Restore a previously deleted core/community build (admin only)  |

### 🔐 Authentication

| Method | Endpoint             | Description                                      |
| ------ | -------------------- | ------------------------------------------------ |
| GET    | `/api/auth/github`   | Initiate GitHub login                            |
| GET    | `/api/auth/callback` | GitHub OAuth callback                            |
| GET    | `/api/auth/me`       | Fetch authenticated user profile (auth required) |
| POST   | `/api/auth/logout`   | Log out the current user                         |

## 🌱 Structure of this Project

```bash
/DevFoundry-Backend

├── api/                           # Entry point for API routing
│ └── index.js
├── controllers/                   # Business logic for auth and build routes
│ ├── authController.js
│ └── buildsController.js
├── middleware/                    # Auth middleware for route protection
│ └── auth.js
├── models/                        # Mongoose schemas for MongoDB
│ ├── authUserModel.js
│ └── buildsModel.js
├── routes/                        # Route definitions and grouping
│ ├── authRoutes.js
│ ├── index.js
│ └── buildsRoutes.js
├── utils/                         # Shared utilities (JWT, error handling)
│ ├── error.js
│ └── jwt.js
├── .env                           # Environment variables (fill actual values)
├── index.js                       # App entry point
└── README.md                      # Project documentation

```

## 🔥 Clone this Repository

You need to write the following commands on the terminal screen (in vscode) so that you can run this project locally.

```bash
git clone "https://github.com/chetannada/DevFoundry-Backend.git"
```

Go to the project directory

```bash
cd DevFoundry-Backend
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
