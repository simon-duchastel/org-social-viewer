# How to Contribute

This document outlines how to contribute to this codebase. You must strictly follow the rules here before opening a pull request proposing a new change.

## Steps to propose a change

1. Create a new branch in the project (use a descriptive name on what you want to achieve)
2. Make your changes.
3. Smoke test your change. This may mean running the UI in the browser or on an emulator, or it may mean calling the function manually from the command line. Ensure your change properly addresses what you're trying to achieve, whether it be a new feature or a bug fix.
4. Ensure all tests pass. Add any new tests. Read and follow the [testing guidelines](testing.md).
6. Make sure all documentation is up to date. Add or update any new documentation as-needed. Read and follow [the documentation guidelines](docs.md).

## Contribution Rules

1. ALWAYS ensure your change is properly documented, if necessary. Documentation is not required for small changes, only medium-large or conceptually interesting changes. Keep documentation high-level yet specific, and do not document every variable and function change you make - if it is a small change, it doesn't always necessitate documentation. Read and follow [the documentation guidelines](docs.md).
2. ALWAYS ensure your change is properly tested. All tests must pass before submitting, and any new changes must be properly tested. Read and follow the [testing guidelines](testing.md).
3. ALWAYS work from within the confines of the technology stack. DO NOT add new technologies or use a different approach than what is described in the relevant [technology stack document](technology-stack/) document. Read and follow the [technology stack](technology-stack/) for whatever portion of the codebase you're working in. If you absolutely feel that a new technology or approach would be beneficial, open a [Github issue](https://github.com/simon-duchastel/org-social-viewer/issues/new) with your reasoning.

## Project Philosophy

1. The repository is organized by folders and sub-folders. Each folder should contain a logical grouping of files. Ex. the [web/componets/ui/](../web/components/ui/) folder contains UI React components. Each folder should have a single high-level purpose. Create a new folder in the relevant sub-folder whenever you find the current one is growing too big and/or the change you're making fits a sufficiently new purpose.
2. Keep files small and granular. Each file should have a single purpose. Create a new file in the relevant sub-folder whenever you find the current one is growing too big and/or the change you're making fits a sufficiently new purpose.
3. Keep functions/classes small and granular. Each function/class should have a single purpose. Create a new function or class in the relevant file whenever you find the current one is growing too big and/or the change you're making fits a sufficiently new purpose.
4. Code is self-documenting. Use comments only when absolutely necessary, ex. when there's a hidden gotcha in the code

## Security Guidelines

- Never commit secrets, keys, or sensitive data
- Follow security best practices in all code
- Validate and sanitize user inputs