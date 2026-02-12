# Contributing to Smart Campus Maintenance System

First off, thank you for considering contributing to the Smart Campus Maintenance System! We are a team of 8 building a robust facility management solution, and your help is valuable.

## 🚀 Getting Started

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone [https://github.com/Duke-Dz/campus-maintenance-system.git](https://github.com/Duke-Dz/campus-maintenance-system.git)
    cd campus-maintenance-system
    ```
3.  **Sync with upstream** (if you are working on a fork):
    ```bash
    git remote add upstream [https://github.com/Duke-Dz/campus-maintenance-system.git](https://github.com/Duke-Dz/campus-maintenance-system.git)
    git fetch upstream
    ```

## 🛠 Development Workflow

We follow a **Feature Branch Workflow**.

1.  **Create a branch** for your specific task:
    - Format: `type/feature-name`
    - Examples: `feat/login-page`, `fix/assignment-logic`, `docs/er-diagram`
    ```bash
    git checkout -b feat/your-feature-name
    ```
2.  **Commit** your changes (see Commit Messages below).
3.  **Push** to your fork and submit a **Pull Request (PR)**.

---

## 📝 Coding Standards

### **Frontend (React)**

- **Functional Components:** Always use functional components with Hooks (`useState`, `useEffect`).
- **Folder Structure:** Keep components in their specific folders (e.g., `components/StudentPortal`).
- **State Management:** Use Context API for global state (User Auth, Theme).
- **Styling:** Use CSS Modules or the global `variables.css` for consistency.

### **Backend (Java Spring Boot)**

- **Architecture:** Adhere strictly to Controller → Service → Repository layers.
- **DTOs:** Never expose Entity classes directly in the API. Use DTOs (Data Transfer Objects).
- **Security:** All endpoints must be secured with `@PreAuthorize` annotations unless public.
- **Error Handling:** Use the global `exception/` handler; avoid empty try-catch blocks.

### **Optimization Engine (C++)**

- **JNI:** Ensure `jni_bindings.h` matches the Java native method signatures.
- **Memory:** Manually manage memory; ensure no leaks in the assignment algorithm.

---

## 💾 Commit Messages

We follow the **Conventional Commits** specification.

Format: `<type>(<scope>): <subject>`

- **feat**: A new feature (e.g., `feat(auth): implement JWT login`)
- **fix**: A bug fix (e.g., `fix(ticket): resolve image upload error`)
- **docs**: Documentation only changes
- **style**: Formatting, missing semi-colons, etc; no code change
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests

---

## 🐛 Reporting Bugs & Issues

If you find a bug, please create an Issue using our template. Include:

1.  **Steps to reproduce** the bug.
2.  **Expected behavior**.
3.  **Screenshots** (if UI related) or **Log snippets** (if Backend related).

## 📜 Code of Conduct

Please be respectful and professional. We are building a system to help our campus, and collaboration is key.
