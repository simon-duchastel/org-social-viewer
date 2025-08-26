# Web Application

A Next.js-based web application for viewing and interacting with org-mode social media content.

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

The application will be available at `http://localhost:<port>`, where `<port>` is output by the tool on the command line (usually 3000 but confirm before loading the application).

### Build

```bash
npm run build
npm run start
```

## Architecture

### Project Structure

```
web/
├── app/
│   ├── api/           # Next.js API routes (see app/api/README.md)
│   ├── layout.js      # Root layout
│   ├── page.js        # Home page
│   └── globals.css    # Global styles
├── components/        # React components (see components/README.md)
├── lib/               # Core parsing library (see lib/README.md)
├── public/            # Static assets and sample data
├── utils/             # Utility functions (see utils/README.md)
├── package.json       # Dependencies and scripts
└── next.config.js     # Next.js configuration
```

## Org-mode Format

For the authoritative org-mode format see the [org-mode social spec](https://github.com/tanrax/org-social).

## Testing

Run tests:
```bash
npm run test
```