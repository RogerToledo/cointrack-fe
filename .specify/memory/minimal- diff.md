# Skill: Minimal Diff & Surgical Changes

When modifying existing files in cointrack-fe, you MUST adhere to the Principle of Minimal Diff to keep pull requests focused, safe, and easy to review.

## Minimal Diff Principles
- **Surgical Edits**: Touch ONLY the exact lines of code required to implement the task or fix the issue.
- **No Unrelated Formatting**: Do NOT reformat untouched lines, reorder imports, or alter whitespace outside the immediate scope of your changes.
- **Preserve Local Style**: Match the formatting, variable naming conventions, and idioms of the surrounding legacy or modern code.
- **Avoid Unrequested Refactoring**: Do NOT fix adjacent code smells, rename untouched variables, or "clean up" unrelated functions unless explicitly mandated in `specs/`.
- **Focus Git Diffs**: Ensure every modified line in `git diff` maps directly to an active task in `specs/`.