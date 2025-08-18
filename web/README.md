# Org Social Viewer - Web Application

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

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
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

## Usage

1. Start the development server
2. Upload an org-mode file using the file input
3. Or enter a URL to an org-mode file
4. Browse the parsed content through the timeline interface
5. Click on profiles to view detailed information

## Contributing

This is part of the larger org-social-viewer project. Please see the main project README for contribution guidelines.