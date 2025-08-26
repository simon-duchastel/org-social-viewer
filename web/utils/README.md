# Utility Functions

This directory contains utility functions used throughout the web application.

## API Client (`apiClient.js`)

Client-side API wrapper functions for communicating with the backend endpoints.

### Functions

#### `fetchOrgSocial(url)`
Fetches and parses a remote org-mode file via the `/api/fetch-and-parse` endpoint.

**Parameters**:
- `url`: URL to the remote org-mode file

**Returns**: Promise resolving to parsed org-social data (see the [API spec for details on the returned object](../app//api//README.md)).

#### `parseOrgSocialContent(content, sourceUrl = '')`
Parses org-mode content via the `/api/parse` endpoint.

**Parameters**:
- `content`: Raw org-mode file content
- `sourceUrl`: Optional source URL for context

**Returns**: Promise resolving to parsed org-social data (see the [API spec for details on the returned object](../app//api//README.md)).

#### `fetchFollowedUsers(mainUser)`
Fetches followed users for a given profile via the `/api/fetch-followed` endpoint.

**Parameters**:
- `mainUser`: User profile object containing follow information

**Returns**: Promise resolving to followed users array (see the [API spec for details on the returned object](../app//api//README.md)).

### Error Handling
All API functions include comprehensive error handling with:
- HTTP status code checking
- JSON error response parsing
- Console logging for debugging
- Proper error propagation to calling components

## Date Utilities (`dateUtils.js`)

Utility functions for handling timestamp parsing and formatting.

### Functions

#### `parseOrgSocialTimestamp(timestamp)`
Parses RFC 3339 timestamp strings with fallback handling.

**Parameters**:
- `timestamp`: Timestamp string in various formats

**Returns**: JavaScript Date object or null if parsing fails.

### Usage Example
```javascript
import { parseOrgSocialTimestamp } from './dateUtils.js'

const date = parseOrgSocialTimestamp('2023-12-01T10:30:00Z')
if (date) {
  console.log(date.toLocaleDateString())
}
```