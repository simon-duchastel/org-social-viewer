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
