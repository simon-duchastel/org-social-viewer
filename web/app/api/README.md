# API Endpoints

This directory contains Next.js API routes for handling org-mode file processing and parsing.

## Common Features

### Error Handling
All endpoints include:
- Input validation and sanitization
- Comprehensive error messages
- HTTP status codes (200 for success, 400/500 for errors)
- JSON error responses with descriptive messages

### CORS Support
- Configured for cross-origin requests
- Handles preflight requests appropriately
- Supports frontend deployment scenarios

### Performance
- Efficient org-mode parsing
- Minimal external dependencies
- Optimized for typical org-social file sizes

## Endpoints

### `POST /api/parse`
Parses org-mode content to structured JSON data.

**Route**: `parse/route.js`

**Request Body**:
```javascript
{
  content: "#+TITLE: My Feed\n* Posts\n...",  // Raw org-mode content
  sourceUrl: "https://example.com/feed.org"   // Optional source URL
}
```

**Response**:
```javascript
{
  profile: {
    title: "My Feed",
    nick: "username",
    avatar: "/avatar.svg",
    followed: [...],
    metadata: {...}
  },
  posts: [
    {
      id: "unique-id",
      timestamp: "2023-12-01T10:30:00Z",
      content: "Post content...",
      mood: "happy",
      language: "en",
      tags: [...]
    }
  ],
  error: null
}
```

**Error Response**:
```javascript
{
  error: "Error message describing what went wrong"
}
```

### `GET /api/fetch-and-parse?url=<url>`
Fetches a remote org-mode file and parses it to JSON.

**Route**: `fetch-and-parse/route.js`

**Query Parameters**:
- `url`: URL to the remote org-mode file

**Response**: Same format as `/api/parse`

**Features**:
- Fetches remote org-mode files via HTTP/HTTPS
- Handles network errors and invalid URLs
- Parses fetched content using the same parser as `/api/parse`
- Returns structured data ready for frontend consumption

### `POST /api/fetch-followed`
Fetches followed users from org-mode files.

**Route**: `fetch-followed/route.js`

**Request Body**:
```javascript
{
  mainUser: {
    profile: {...},      // User profile with follow information
    sourceUrl: "..."     // Base URL for resolving relative followed URLs
  }
}
```

**Response**:
```javascript
{
  followed: [
    {
      nick: "alice",
      url: "/alice.org",
      profile: {...}       // Parsed profile data if fetchable
    },
    {
      nick: "bob", 
      url: "/bob.org",
      profile: {...}
    }
  ],
  error: null            // Or error message if something went wrong
}
```
