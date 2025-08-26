# Core Components

Core components handle the main application logic, state management, and data coordination. These components form the backbone of the org-social-viewer application.

## Components

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