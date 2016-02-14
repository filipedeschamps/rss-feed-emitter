<p align="center">
  <img src="https://raw.githubusercontent.com/filipedeschamps/rss-feed-emitter/master/content/logo.gif">
</p>

<h1 align="center">RSS Feed Emitter</h1>

<p align="center">
  <a href="https://travis-ci.org/filipedeschamps/rss-feed-emitter">
    <img src="https://travis-ci.org/filipedeschamps/rss-feed-emitter.svg?branch=master">
  </a>
  <a href="https://codeclimate.com/github/filipedeschamps/rss-feed-emitter/coverage">
    <img src="https://codeclimate.com/github/filipedeschamps/rss-feed-emitter/badges/coverage.svg">
  </a>
  <a href="https://www.npmjs.com/package/rss-feed-emitter">
    <img src="https://david-dm.org/filipedeschamps/rss-feed-emitter.svg">
  </a>
  <a href="https://www.npmjs.com/package/rss-feed-emitter">
    <img src="https://badge.fury.io/js/rss-feed-emitter.svg">
  </a>
</p>

<p align="center">
  Track tons of feeds and receive events for every new item published with this super RSS News Feed aggregator.
</p>



## Features

 * Supports Node.js `0.10.x`, `0.12.x`, `4.x`, `5.x`, and `@stable`
 * 100% code coverage with unit and integration tests
 * Simple interface
 * Automatically manages feed history memory
 * Written in ES6

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
