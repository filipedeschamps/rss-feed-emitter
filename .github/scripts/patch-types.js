#!/usr/bin/env node
'use strict';

/**
 * Post-process generated TypeScript declarations
 * This script patches FeedItem.d.ts to add property definitions
 * since TypeScript doesn't generate properties from @property JSDoc tags on empty classes
 */

const fs = require('fs');
const path = require('path');

const feedItemPath = path.join(__dirname, '../types/FeedItem.d.ts');

// Read the generated FeedItem.d.ts
let content = fs.readFileSync(feedItemPath, 'utf8');

// The properties to add (extracted from JSDoc in src/FeedItem.js)
const properties = `    title?: string;
    description?: string;
    summary?: string;
    date?: Date;
    pubdate?: Date;
    link?: string;
    origlink?: string;
    author?: string;
    guid?: string;
    comments?: string;
    image?: any;
    categories?: string;
    enclosures?: any;
    meta?: any;
    [key: string]: any;`;

// Replace the empty class body with properties
content = content.replace(
  /declare class FeedItem\s*{\s*}/,
  `declare class FeedItem {\n${properties}\n}`
);

// Write back
fs.writeFileSync(feedItemPath, content, 'utf8');

console.log('✓ Patched FeedItem.d.ts with property definitions');
