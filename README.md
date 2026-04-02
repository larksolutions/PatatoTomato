# MERN Boilerplate

A dynamic, production-ready MERN stack boilerplate with Tailwind CSS, Axios, and Ionicons.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS       |
| Backend  | Node.js, Express 4                 |
| Database | MongoDB (Mongoose 8)               |
| HTTP     | Axios                              |
| Icons    | Ionicons (via react-icons/io5)     |
| Routing  | React Router DOM 6                 |

## Quick Start

### 1. Setup (rename & configure)

```bash
cd mern-boilerplate
npm run setup
```

You'll be prompted for:
- **Project name** — renames all package.json files and the HTML title
- **MongoDB URI** — your local or Atlas connection string
- **Server port** — Express server port (default: 5000)
- **Client port** — Vite dev server port (default: 5173)

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Start development

```bash
npm run dev
```

This starts both the Express server and Vite dev server concurrently.

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

## Project Structure

```
mern-boilerplate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities (Axios instance)
│   │   ├── assets/         # Static assets
│   │   ├── styles/         # CSS (Tailwind)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.development
│   ├── .env.production
│   └── vite.config.js
├── server/                 # Express backend
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   ├── .env.development
│   ├── .env.production
│   └── index.js
├── setup.js                # Interactive setup script
└── package.json            # Root scripts
```

## Environment Config

| File                          | Purpose            |
| ----------------------------- | ------------------ |
| `server/.env.development`     | Dev server config  |
| `server/.env.production`      | Prod server config |
| `client/.env.development`     | Dev client config  |
| `client/.env.production`      | Prod client config |

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run setup`     | Interactive project configuration        |
| `npm run install:all` | Install client & server dependencies   |
| `npm run dev`       | Start both servers in dev mode           |
| `npm run build`     | Build client for production              |
| `npm start`         | Start server in production mode          |
# mern-boilerplate
# PatatoTomato
