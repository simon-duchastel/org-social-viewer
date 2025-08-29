# Utility Functions

This directory contains utility functions used throughout the web application.

## API Client (`apiClient.js`)

Client-side API wrapper functions for communicating with the backend endpoints.

### Functions

#### `fetchOrgSocial(url)`
Fetches and parses a remote org-mode file via the `/api/fetch-and-parse` endpoint.

**Parameters**:
- `url`: URL to the remote org-mode file

**Returns**: Promise resolving to parsed org-social data (see the [API spec for details on the returned object](../app/api/README.md)).

#### `parseOrgSocialContent(content, sourceUrl = '')`
Parses org-mode content via the `/api/parse` endpoint.

**Parameters**:
- `content`: Raw org-mode file content
- `sourceUrl`: Optional source URL for context

**Returns**: Promise resolving to parsed org-social data (see the [API spec for details on the returned object](../app/api/README.md)).

#### `fetchFollowedUsers(mainUser)`
Fetches followed users for a given profile via the `/api/fetch-followed` endpoint.

**Parameters**:
- `mainUser`: User profile object containing follow information

**Returns**: Promise resolving to followed users array (see the [API spec for details on the returned object](../app/api/README.md)).

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

## Post Grouping (`postGrouping.js`)

Utility functions for organizing social media posts and their reply relationships.

### Functions

#### `groupRepliesWithParents(posts)`
Groups reply posts under their parent posts and sorts them appropriately for timeline display.

**Behavior**:
- Parent posts are sorted by timestamp (newest first)
- Replies are grouped immediately after their parent posts
- Within each parent group, replies are sorted chronologically (oldest first)
- Orphaned replies (replies to posts not in the feed) are included at the end
- Does not mutate the input array

**Parameters**:
- `posts`: Array of post objects with the following structure:
  - `id`: Unique identifier (typically timestamp string)
  - `isReply`: Boolean indicating if this is a reply
  - `replyTo`: ID of the parent post (if this is a reply)
  - Other post properties (content, user, etc.)

**Returns**: New array of posts organized with replies grouped under their parents.

### Usage Example
```javascript
import { groupRepliesWithParents } from './postGrouping.js'

const posts = [
  { id: '2025-01-01T10:00:00+00:00', content: 'Original post', isReply: false },
  { id: '2025-01-01T11:00:00+00:00', content: 'Reply', isReply: true, replyTo: '2025-01-01T10:00:00+00:00' },
  { id: '2025-01-02T10:00:00+00:00', content: 'Another post', isReply: false }
]

const grouped = groupRepliesWithParents(posts)
// Result: [newer post, original post, reply, ...]
```