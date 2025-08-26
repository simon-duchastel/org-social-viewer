# Web Application

A Next.js-based web application for viewing and interacting with org-mode social media content.

## Features

- **Org-mode File Upload**: Upload `.org` files containing social media data
- **URL-based Loading**: Load org-mode files directly from URLs
- **Interactive Timeline**: Browse through posts with an intuitive timeline interface
- **Profile Management**: View and manage multiple social media profiles
- **Real-time Parsing**: Parse org-mode syntax in real-time for immediate viewing

## Technology Stack

- **Next.js 14** with React 18 for modern web development
- **CSS Modules** for component-scoped styling
- **Framer Motion** for smooth animations
- **Modern ES6+** JavaScript
- **Org-mode Parser** for processing social media content

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
web/
├── app/
│   ├── layout.js      # Root layout
│   ├── page.js        # Home page
│   └── globals.css    # Global styles
├── components/        # React components
├── utils/            # Utility functions
├── package.json      # Dependencies and scripts
└── next.config.js    # Next.js configuration
```

## Key Components

### MainApp (`components/MainApp.jsx`)
- Main application container
- Handles URL loading and file upload
- Manages application state

### Timeline (`components/Timeline.jsx`)  
- Displays chronological post feed
- Handles post sorting and filtering
- Integrates with Profile component

### Profile (`components/Profile.jsx`)
- Shows user metadata and stats
- Displays followed users
- Handles profile switching

### Parser (`lib/orgSocialParser.js`)
- Converts org-mode text to structured data
- Handles timestamps, tags, mood, language
- Extracts posts, profiles, and metadata

## API Endpoints

### `POST /api/parse`
Parse org-mode content to JSON
```javascript
// Request
{ content: "#+TITLE: My Feed\n* Posts\n..." }

// Response  
{ profile: {...}, posts: [...], error: null }
```

### `GET /api/fetch-and-parse?url=`
Fetch remote .org file and parse
```javascript
// Response
{ profile: {...}, posts: [...], error: null }
```

### `GET /api/fetch-followed?url=`
Get followed users from .org file
```javascript
// Response
{ followed: [{ nick: "alice", url: "/alice.org" }] }
```

## Org-mode Format

For the authoritative org-mode format see the [org-mode social spec](https://github.com/tanrax/org-social).

## State Management

- URL params for navigation state
- React state for UI components  
- Browser history API for back/forward
- Local error handling per component

## Styling

- CSS Modules for component styles
- Global CSS for layout and typography
- Framer Motion for animations
- Responsive design with CSS Grid/Flexbox

## Testing

Run parser tests:
```bash
npm run test
```

Tests cover:
- Org-mode parsing accuracy
- Timestamp handling
- Error cases and malformed data
- Profile and post extraction