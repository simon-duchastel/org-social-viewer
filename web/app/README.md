# Next.js App Directory

This directory contains the Next.js App Router application structure for the org-social-viewer.

## Architecture

The app uses Next.js 14's App Router with React Server Components and client-side rendering where needed.

### Project Structure

```
app/
├── api/               # Next.js API routes for backend functionality
├── layout.js          # Root layout component with global metadata
├── page.js            # Home page with URL input and main application
└── globals.css        # Global CSS styles and variables
```

## Core Files

### Root Layout (`layout.js`)
- Defines the HTML document structure
- Sets global metadata (title, description)
- Provides the root `<html>` and `<body>` elements
- Imports global CSS styles

### Home Page (`page.js`)
- Client-side rendered main page component
- Manages application state transitions:
  - URL input screen for loading org-mode files
  - Main application view for browsing content
- Handles browser navigation and URL parameters
- Integrates with Framer Motion for smooth page transitions
- Manages URL state persistence in browser history

### Global Styles (`globals.css`)
- CSS custom properties for theming
- Global reset and base styles
- Typography and layout foundations
- Color scheme and spacing variables

### Backend API

See **[API Endpoints](api/README.md)** for detailed documentation of the backend functionality.

## Features

### State Management
- Uses React hooks for local state management
- URL parameters for persistent application state
- Browser history integration for proper back button support

### Navigation
- Seamless transitions between URL input and main application
- Browser back/forward button support
- URL parameter-based state restoration

### Animation
- Framer Motion integration for smooth page transitions
- Exit/enter animations between application states
- Responsive animation timing

### API Integration
- Client-side integration with Next.js API routes
- Fetching and parsing org-mode files
- Error handling and loading states
