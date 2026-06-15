# FreelanceHub (SkillBridge)

Welcome to the **FreelanceHub (SkillBridge)** repository! This project is a professional, scalable, and highly performant web application designed to connect freelancers with clients. This document outlines our project overview, development standards, folder structure, and contribution workflows.

---

## 🎯 Project Overview

FreelanceHub is a modern platform that streamlines the process of finding, hiring, and managing freelance talent. The platform features robust user authentication, interactive dashboards for both freelancers and clients, real-time messaging, and secure payment handling.

### Key Features
- **Role-Based Onboarding:** Seamless sign-up flows tailored for clients and freelancers.
- **Dynamic Dashboards:** Dedicated analytics and project management interfaces.
- **Job Proposals & Bidding:** An intuitive system for posting jobs and reviewing freelancer proposals.
- **Real-Time Communication:** Integrated messaging system for project coordination.
- **Secure Payments:** Comprehensive payment tracking and history interface.

---

## 🛠 Tech Stack

Our front-end architecture is built for speed, maintainability, and developer experience:

- **HTML5:** Semantic and accessible standard HTML.
- **Tailwind CSS:** Utility-first CSS framework for rapid, consistent UI development.
- **Vite:** Next-generation frontend tooling for instantaneous hot module replacement (HMR) and optimized builds.
- **JavaScript (ES6+):** Modern JavaScript for DOM manipulation and client-side logic.
- **Prettier:** Opinionated code formatter to maintain a unified code style across the team.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FreelanceHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The server will start locally (usually on `http://localhost:5173`). Vite provides Hot Module Replacement (HMR), so any saved changes will instantly reflect in your browser.*

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Architecture & Folder Structure

We enforce a strict separation of concerns to prevent merge conflicts and ensure maintainability:

```text
FreelanceHub/
├── .vscode/                  # Workspace settings and snippets
├── assets/                   # Public static assets
├── backend/                  # Backend infrastructure and API code
├── components/               # Reusable HTML UI components
├── docs/                     # Comprehensive team documentation
├── icons/                    # SVG icons and web fonts
├── scripts/                  # Build and deployment scripts
├── src/                      # Core source files
│   ├── css/                  # Global styles and Tailwind directives
│   ├── js/                   # Shared JavaScript utilities and API clients
│   └── images/               # Application imagery
├── *.html                    # Application views (e.g., index.html, login.html)
├── .editorconfig             # Editor configuration for consistent formatting
├── .prettierrc               # Prettier configuration rules
├── tailwind.config.js        # Tailwind CSS theme and design system tokens
├── package.json              # Project dependencies and NPM scripts
└── README.md                 # Project documentation
```

---

## 🤝 Team Workflow & Git Guidelines

To ensure smooth collaboration among developers and prevent merge conflicts, we strictly adhere to a feature-branch workflow. **Direct pushes to the `main` branch are strictly prohibited.**

### Daily Development Lifecycle

#### 1. Sync with the remote
Always start your work by ensuring your local `main` branch is up to date:
```bash
git checkout main
git pull origin main
```

#### 2. Create a working branch
Create a new branch off of `main` for your specific task:
```bash
git checkout -b <type>/<short-description>
```
**Naming Conventions:**
- Features: `feature/login-validation`
- Bug Fixes: `bugfix/nav-alignment`
- Hotfixes: `hotfix/production-crash`
- Chores: `chore/update-dependencies`

#### 3. Commit your changes
We use [Conventional Commits](https://www.conventionalcommits.org/) to auto-generate changelogs and maintain a readable history:
```bash
git add .
git commit -m "feat: add payment history table"
```
*(Common prefixes: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `docs:`)*

#### 4. Resolve conflicts early
If `main` is updated while you are working, rebase or merge the latest changes into your branch:
```bash
git fetch origin
git rebase origin/main
```

#### 5. Push and open a Pull Request (PR)
Push your branch to the remote repository:
```bash
git push origin <your-branch-name>
```
1. Open a Pull Request targeting the `main` branch.
2. Provide a clear PR description outlining your changes and testing steps.
3. Tag at least **one peer reviewer**.
4. Once approved and CI checks pass, use **Squash and Merge** to integrate your code.

---

## 🎨 Coding Standards

To ensure a high-quality codebase, all contributors must follow these standards:

### HTML & CSS
1. **Formatting:** We use Prettier. Ensure your editor is configured to format on save, or run `npm run format` prior to committing.
2. **Styling:** Rely exclusively on Tailwind CSS utility classes. Avoid writing custom CSS in `.css` files unless absolutely necessary for complex animations or third-party overrides.
3. **Responsiveness:** Adopt a **mobile-first** approach. Use standard Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) to build responsive layouts.
4. **Semantics:** Use semantic HTML5 tags (`<main>`, `<section>`, `<nav>`, `<article>`, `<header>`, `<footer>`) to improve accessibility and SEO.

### File Naming
- Use lowercase with hyphens (`kebab-case`) for all HTML files, CSS files, JavaScript files, and assets (e.g., `role-selection.html`, `user-profile.js`).

---

## 🛡️ Security & Environment Variables
- **Never commit secrets:** Do not commit `.env` files, API keys, or database credentials.
- **Environment config:** Use `.env.example` to document required environment variables without exposing sensitive values.

---

**Built with ❤️ by the FreelanceHub Team.**
