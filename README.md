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

To ensure smooth collaboration among the 4 developers and prevent merge conflicts, we follow a strict Git flow. **Never push directly to the `main` branch.**

### Step-by-Step Daily Workflow

#### 1. Always start by pulling the latest code
Before starting any new work, make sure your local `main` branch is completely up to date with the team:
```bash
git checkout main
git pull origin main   eyta oneik important
```

#### 2. Create your working branch
Create a new branch branching off of the updated `main`:
```bash
git checkout -b feature/your-feature-name
```
*Naming conventions:*
- Features: `feature/short-description` (e.g., `feature/login-validation`)
- Bug Fixes: `bugfix/issue-description` (e.g., `bugfix/nav-alignment`)

#### 3. Commit your changes
We use **Conventional Commits**. Group your work into logical commits:
```bash
git add .
git commit -m "feat: add payment history table"
```
*(Use `feat:`, `fix:`, `chore:`, `style:`, etc.)*

#### 4. Keep your branch updated (Optional but recommended)
If someone else merges code into `main` while you are working, pull their changes into your branch to avoid conflicts later:
```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

#### 5. Push your branch
Once your work is ready, push your specific branch to GitHub/GitLab:
```bash
git push origin feature/your-feature-name
```

#### 6. Open a Pull Request (PR)
1. Go to the repository online and open a Pull Request comparing your branch to `main`.
2. **Code Review:** Tag at least **1 other team member** to review your PR.
3. Once approved, merge it (preferably using **Squash and Merge**) to keep the commit history clean.

---

## 🎨 Coding Standards

### HTML & CSS
1. **Formatting:** We use Prettier. Run `npm run format` before creating a pull request.
2. **Tailwind:** Avoid creating custom CSS classes. Rely on Tailwind utility classes.
3. **Responsive Design:** Develop mobile-first. Use `md:`, `lg:`, `xl:` prefixes appropriately.

### File Naming
- Use lowercase with hyphens (kebab-case) for all HTML and asset files (e.g., `role-selection.html`).
