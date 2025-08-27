# Documentation

This repository follows a documentation approach designed for both human developers and AI agents.

## Documentation Philosophy

- **Concise**: Essential information only, no redundancy
- **Prescriptive**: Clear instructions and actionable guidance  
- **Granular**: One specific topic per document
- **Accessible**: Written for both humans and AI consumption

## Rules for Adding or Maintaining Documentation

1. Every folder MUST have a README.md file describing its contents and use.
2. Every README.md file MUST have a CLAUDE.md and AGENTS.md file in the same directory symlinked to it. ie. every folder will contain a CLAUDE.md->README.md and AGENTS.md->README.md.
3. Whenever you add a new sub-folder, you MUST add a new README.md file for that folder, as well as corresponding CLAUDE.md and AGENTS.md symlinks.
4. Keep documentation concise. Do not be overly verbose.
5. Keep documentation high-level. You should NOT document every function and variable. Rather, provide documentation for the high-level purpose of the folder or file. Focus on purpose, not exact function.
6. Keep documentation prescriptive. Every doc, whether it be a README or otherwise, must contain specific information on what to do and avoid vague generalizations.
7. You MUST always add and update ALL documentation that pertains to your changes. This will usually mean modifying the README.md in the local sub-folder, but may also include modifying other documents as well.
