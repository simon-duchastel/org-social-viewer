# Org Social Viewer

A comprehensive platform for viewing and managing org-mode social media content across multiple platforms.

## Overview

Org Social Viewer enables users to parse, view, and interact with social media content stored in org-mode format. The platform provides an intuitive interface for browsing timeline data, managing profiles, and organizing social media interactions.

## Project Structure

```
org-social-viewer/
├── web/                # Web application (React + Vite)
├── org-social.el       # Emacs Lisp utilities
├── social.org          # Sample org-mode social data
└── README.md           # This file
```

## Components

### Web Application (`web/`)

A modern React-based web interface that provides:
- Org-mode file upload and URL loading
- Interactive timeline browsing
- Profile management
- Real-time content parsing

See [web/README.md](web/README.md) for detailed setup and usage instructions.

### Emacs Integration (`org-social.el`)

Emacs Lisp utilities for enhanced org-mode social media workflow integration.

## Getting Started

### Web Application

```bash
cd web
npm install
npm run dev
```

The web application will be available at `http://localhost:5173`

## Use Cases

- **Content Creators**: Organize and review social media content in org-mode format
- **Researchers**: Analyze social media data structures and patterns
- **Developers**: Build upon the org-mode parsing infrastructure
- **Emacs Users**: Integrate social media workflows with existing org-mode setups

## Features

- 📱 Cross-platform web interface
- 📝 Native org-mode syntax support
- 🔄 Real-time content parsing
- 👤 Profile and timeline management
- 🔗 URL-based content loading
- 📁 File upload capabilities

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

This project is open source. Please see individual component directories for specific licensing information.