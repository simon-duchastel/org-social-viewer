# Core Library

This directory contains the core parsing library for processing org-mode social media files.

## Parser (`orgSocialParser.js`)

The main org-mode parser that converts org-mode text to structured JavaScript data.g

### Core Functions

#### `parseOrgFile(content)`
Main parsing function that processes org-mode content.

**Input**: Raw org-mode file content as string
**Output**: Structured object containing:
```javascript
{
  profile: {
    title: string,
    nick: string,
    avatar: string,
    followed: Array,
    metadata: Object
  },
  posts: Array,
  error: null | string
}
```

#### Post Structure
Each parsed post contains:
- `id`: Unique identifier
- `timestamp`: Parsed date/time
- `content`: Post text content
- `mood`: Optional mood indicator
- `language`: Optional language tag
- `tags`: Array of custom tags

#### Profile Structure
Parsed profile information includes:
- User metadata (title, nickname, avatar)
- Followed users list with navigation URLs
- Profile settings and preferences

### Testing

Tests are located in `orgSocialParser.test.js`.

Run tests with:
```bash
npm run test
```