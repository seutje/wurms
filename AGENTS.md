# Instructions for AI Agents Working on the Wurms Project

This document provides guidelines and instructions for AI agents contributing to the Wurms project. Adhering to these guidelines will ensure consistency, maintainability, and high quality in the codebase.

## 1. Project Overview

The Wurms project is a web-based game, likely a Worms-like artillery game, built using TypeScript and the Kontra.js game engine. It includes an AI component for training game agents.

## 2. Technology Stack

*   **Language**: TypeScript
*   **Build Tool/Dev Server**: Vite
*   **Game Engine**: Kontra.js
*   **Testing Framework**: Vitest
*   **Package Manager**: npm
*   **Styling**: CSS

## 3. Coding Conventions

*   **Language**: All new code and modifications should primarily be in TypeScript. If a JavaScript file needs modification, consider converting it to TypeScript if it aligns with the project's direction.
*   **Formatting**: Adhere to existing Prettier/ESLint configurations if present. Otherwise, follow common TypeScript best practices:
    *   Use 2 spaces for indentation.
    *   Use single quotes for strings.
    *   Use semicolons at the end of statements.
    *   Prefer `const` and `let` over `var`.
    *   Use arrow functions for callbacks.
*   **Naming**:
    *   Files: `PascalCase.ts` for classes/components, `camelCase.ts` for utility files.
    *   Variables/Functions: `camelCase`.
    *   Classes/Interfaces/Types: `PascalCase`.
*   **Modularity**: Keep files and functions small and focused on a single responsibility.
*   **Comments**: Add comments sparingly, primarily for explaining *why* a piece of code exists or for complex logic. Do not comment on obvious code.

## 4. Testing

*   **Framework**: Vitest is used for unit and integration testing.
*   **Running Tests**: To run all tests, use the command:
    ```bash
    npm test
    ```
*   **Writing Tests**:
    *   For new features or bug fixes, write corresponding tests in a `.test.ts` file alongside the code it tests (e.g., `Wurm.ts` has `Wurm.test.ts`).
    *   Ensure tests cover edge cases and common scenarios.
    *   Tests should be deterministic and independent.
*   **Code Quality**: Before submitting any changes, ensure all existing tests pass and new tests are added where appropriate, additionally, make sure `npm run train 1` executes without errors.

## 5. Version Control (Git)

*   **Branching**: Work on feature branches. Do not commit directly to `main`.
*   **Commit Messages**:
    *   Use imperative mood (e.g., "Fix: ...", "Feat: ...", "Refactor: ...").
    *   Keep subject lines concise (under 50 characters).
    *   Provide a more detailed body if necessary, explaining *what* and *why*.
    *   Reference any related issues.
*   **Pull Requests**: Ensure your branch is rebased on the latest `main` before creating a pull request.

## 6. Tooling and Commands

*   **Install Dependencies**:
    ```bash
    npm install
    ```
*   **Run Training**:
    ```bash
    npm run train x (x = episodes, defaults to 100)
    ```
*   **Start Development Server**:
    ```bash
    npm run dev
    ```
*   **Build for Production**:
    ```bash
    npm run build
    ```
*   **Run Tests**:
    ```bash
    npm test
    ```
*   **Linting/Formatting**: If ESLint or Prettier are configured, ensure you run their respective commands (e.g., `npm run lint`, `npm run format`) before committing.

## 7. Communication

*   **Clarity**: When interacting with the user, be clear, concise, and direct.
*   **Progress**: Inform the user about your progress, especially for long-running tasks.
*   **Questions**: If anything is unclear, ask clarifying questions. Do not make assumptions.

## 8. Safety and Best Practices

*   **Idempotence**: Ensure your operations are idempotent where possible (running them multiple times has the same effect as running them once).
*   **Security**: Be mindful of security implications, especially when handling user input or external data.
*   **No Breaking Changes (without approval)**: Avoid introducing breaking changes without explicit user approval.
*   **Error Handling**: Implement robust error handling for all operations.
*   **Resource Management**: Be efficient with resource usage (CPU, memory, disk I/O).
*   **Self-Correction**: If an error occurs, attempt to diagnose and correct it.
*   **Verification**: Always verify your changes by running tests and, if applicable, building and running the application.
