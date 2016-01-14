# RSS Feed Emitter [![Build Status](https://travis-ci.org/filipedeschamps/rss-feed-emitter.svg?branch=master)](https://travis-ci.org/filipedeschamps/rss-feed-emitter) [![Test Coverage](https://codeclimate.com/github/filipedeschamps/rss-feed-emitter/badges/coverage.svg)](https://codeclimate.com/github/filipedeschamps/rss-feed-emitter/coverage)

> Track tons of feeds and receive events for every new item published with this super RSS news feed aggregator written in Node.js and ES6.

## Features

 * Support for Node.js 0.10, 0.12, 4.x, 5.x and @stable
 * 100% code coverage with unit and integration tests
 * Automatically manage feed history memory
 * Written with ES6

## Usage

This library

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

### Removing feeds

``` js
feeder.remove('http://www.nintendolife.com/feeds/news');
```
