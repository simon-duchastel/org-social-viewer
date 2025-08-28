# org-social-parser

A JavaScript library for parsing `.org` files that follow the [org-social spec](https://github.com/tanrax/org-social).

## Installation

```bash
npm install org-social-parser
```

## Usage

```javascript
import { parseOrgSocial } from 'org-social-parser';

const orgFileContent = `
#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

This is a test post.
`;

const parsedData = parseOrgSocial(orgFileContent);

console.log(parsedData);
```

## Core Functions

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

### Post Structure
Each parsed post contains:
- `id`: Unique identifier
- `timestamp`: Parsed date/time
- `content`: Post text content
- `mood`: Optional mood indicator
- `language`: Optional language tag
- `tags`: Array of custom tags

### Profile Structure
Parsed profile information includes:
- User metadata (title, nickname, avatar)
- Followed users list with navigation URLs
- Profile settings and preferences

## Testing

Tests are located in `test/index.test.js`.

Run tests with:
```bash
npm run test
```
