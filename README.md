# RSS Feed Emitter [![Build Status](https://travis-ci.org/filipedeschamps/rss-feed-emitter.svg?branch=master)](https://travis-ci.org/filipedeschamps/rss-feed-emitter) [![Test Coverage](https://codeclimate.com/github/filipedeschamps/rss-feed-emitter/badges/coverage.svg)](https://codeclimate.com/github/filipedeschamps/rss-feed-emitter/coverage)

Track tons of feeds and receive events for every new item published with this super RSS News Feed aggregator written in Node.js and ES6.

![RSS Feed Emitter Logo](https://raw.githubusercontent.com/filipedeschamps/rss-feed-emitter/master/content/logo.gif)

## Features

 * Supports Node.js `0.10` `0.12` `4.x` `5.x` and `@stable`
 * 100% code coverage with unit and integration tests
 * Simple interface
 * Automatically manage feed history memory
 * Written with ES6

## Usage

### Install

```
$ npm install rss-feed-emitter
```

### Creating an instance

``` js
let RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();
```

### Adding feeds

``` js
feeder.add({
  url: 'http://www.nintendolife.com/feeds/news',
  refresh: 2000
});
```

> Default refresh value is 60 seconds

### Listening to new items

``` js
feeder.on('new-item', function(item) {
  console.log(item);
})
```

### Listing all feeds in the instance
``` js
feeder.list();
```

### Removing a single feed

``` js
feeder.remove('http://www.nintendolife.com/feeds/news');
```

### Destroying feed instance

``` js
feeder.destroy();
```
> This will remove all feeds from the instance
