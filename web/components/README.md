# React Components

This directory contains all React components for the org-social-viewer web application.

## Styling

Each component has an associated CSS Module file (`.module.css`) providing:
- Component-scoped styles
- Responsive design patterns
- Consistent theming and typography
- Animation and transition effects

## Components

### Core Components

#### MainApp (`MainApp.jsx`)
- Main application container and entry point
- Handles URL loading and file upload functionality
- Manages global application state
- Coordinates between Profile and Timeline components

#### Timeline (`Timeline.jsx`)  
- Displays chronological post feed in a scrollable interface
- Handles post sorting and filtering logic
- Integrates with Profile component for user switching
- Manages post display and interaction states

#### Profile (`Profile.jsx`)
- Shows user metadata, stats, and profile information
- Displays followed users with navigation links
- Handles profile switching between different org files
- Manages user avatar and profile data display

### UI Components

#### Post (`Post.jsx`)
- Individual post component with content rendering
- Handles timestamp display and formatting
- Supports mood indicators and language tags
- Manages post content parsing and display

#### Header (`Header.jsx`)
- Application header with branding and navigation
- Responsive design for mobile and desktop
- Contains primary navigation elements

#### URLInput (`URLInput.jsx`)
- Input component for loading org files from URLs
- Handles URL validation and loading states
- Provides user feedback for successful/failed loads

#### ErrorMessage (`ErrorMessage.jsx`)
- Reusable error display component
- Handles various error types with appropriate messaging
- Provides user-friendly error feedback

#### LoadingSpinner (`LoadingSpinner.jsx`)
- Loading indicator component
- Used throughout the app during async operations
- Consistent loading state visualization
