# FreelanceHub (SkillBridge) Frontend

Welcome to the FreelanceHub front-end repository! As a team, we are building a professional, scalable, and highly performant web application. This document outlines our development standards, folder structure, and workflows.

## 🛠 Tech Stack
- **HTML5:** Semantic and accessible plain HTML.
- **Tailwind CSS:** Utility-first CSS framework.
- **Vite:** High-performance frontend build tool and local dev server.
- **Prettier:** Code formatter for maintaining consistent style across all team members.

---

## 🚀 Getting Started

1. **Prerequisites:** Ensure you have Node.js installed (v18+ recommended).
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   This will start a local server with Hot Module Replacement (HMR). When you save a file, the browser will update instantly.

---

## 📁 Folder Structure

We use a strict separation of concerns to avoid merge conflicts and keep our codebase clean:

```
FreelanceHub/
├── src/                      # Source code for assets
│   ├── assets/               # Static assets
│   │   ├── css/              # Custom stylesheets (e.g., globals.css)
│   │   ├── js/               # Main JavaScript files and utilities
│   │   └── images/           # Images, SVGs, and icons
├── components/               # Reusable HTML snippets
├── docs/                     # Team documentation
├── index.html                # Landing page
├── login.html                # Login view
├── payments.html             # Payments dashboard view
├── role-selection.html       # Onboarding role selector
├── .editorconfig             # IDE configuration for consistent spacing/tabs
├── .prettierrc               # Prettier configuration rules
├── tailwind.config.js        # Global Tailwind CSS theme and design system tokens
├── package.json              # Project metadata, scripts, and dependencies
└── README.md                 # You are here!
```

---

## 🤝 Team Workflow & Git Guidelines

To ensure smooth collaboration among the 4 developers, we follow a standardized Git flow.

### 1. Branch Naming Convention
Never push directly to the `main` branch. Always create a new branch from up-to-date `main`.
- Features: `feature/short-description` (e.g., `feature/login-validation`)
- Bug Fixes: `bugfix/issue-description` (e.g., `bugfix/nav-alignment`)

### 2. Commit Message Standard
We use Conventional Commits. Your commit messages should be descriptive:
- `feat: add payment history table`
- `fix: resolve mobile overflow on role selection`

### 3. Pull Requests (PRs) & Code Review
1. Once your feature is done, open a PR against `main`.
2. **Code Review:** Tag at least **1 other team member** to review your PR.
3. Fix any feedback, approve, then **Squash and Merge**.

---

## 🎨 Coding Standards

### HTML & CSS
1. **Formatting:** We use Prettier. Run `npm run format` before creating a pull request.
2. **Tailwind:** Avoid creating custom CSS classes. Rely on Tailwind utility classes.
3. **Responsive Design:** Develop mobile-first. Use `md:`, `lg:`, `xl:` prefixes appropriately.

### File Naming
- Use lowercase with hyphens (kebab-case) for all HTML and asset files (e.g., `role-selection.html`).
