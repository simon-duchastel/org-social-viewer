# UI Components

UI components are reusable presentation components that handle user interface elements and interactions. They focus on visual display and user experience rather than application logic.

## Components

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