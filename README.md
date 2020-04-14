<p align="center">
  <img src="https://raw.githubusercontent.com/filipedeschamps/rss-feed-emitter/master/content/logo.gif">
</p>

<h1 align="center">RSS Feed Emitter</h1>

<p align="center">
  <a href="https://travis-ci.org/filipedeschamps/rss-feed-emitter">
    <img src="https://travis-ci.org/filipedeschamps/rss-feed-emitter.svg?branch=master">
  </a>
  <a href='https://coveralls.io/github/filipedeschamps/rss-feed-emitter'>
    <img src='https://coveralls.io/repos/github/filipedeschamps/rss-feed-emitter/badge.svg' alt='Coverage Status' />
  </a>
  <a href="https://www.npmjs.com/package/rss-feed-emitter">
    <img src="https://badge.fury.io/js/rss-feed-emitter.svg">
  </a>
  <a href="https://snyk.io/test/github/filipedeschamps/rss-feed-emitter">
  <img src="https://snyk.io/test/github/filipedeschamps/rss-feed-emitter/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/filipedeschamps/rss-feed-emitter" style="max-width:100%;">
</a>
</p>

<p align="center">
  Track tons of feeds and receive events for every new item published with this super RSS News Feed aggregator.
</p>


## Tutorial

This is a fully functional module, but its source code and repository are also a **super complete tutorial**, covering:

 1. What to do first when creating a module from scratch
 0. How to manage your module in Github and npm
 0. ~~How to transpile your ES6 code into ES5~~ this went away in v3
 0. How to create automated unit and integration tests
 0. How to integrate them with Travis CI and make the build break if tests didn't pass
 0. How to automatically test your module against various versions of Node.js
 0. How to setup a code coverage tool and keep 100% coverage
 0. How to integrate the coverage results with Coveralls
 0. How to configure linting tools to make your code base consistent
 0. How to deploy to Github and npm with tags and releases

If you're afraid to read the source code of the modules you use or to create your first module, this is the best chance you have to break this barrier :)

**[Start here](https://github.com/filipedeschamps/rss-feed-emitter/issues/119)**


## Features

 * Supports Node.js `8.x` up through the current version of node.js
 * Supported Node.js  `4.x`, `5.x`, `6.x`, and `7.x` until rss-feed-emitter version `2.0.1`
 * Supported Node.js `0.10.x` and `0.12.x` until rss-feed-emmiter version `1.0.7`
 * 100% code coverage with unit and integration tests
 * Simple interface
 * Automatically manages feed history memory
 * Written in ES6
 * Special thanks to @TobiTenno for the complete rewrite!


## Usage


### Install

```
$ npm install rss-feed-emitter
```


### Creating an instance

```js
const RssFeedEmitter = require('rss-feed-emitter');
const feeder = new RssFeedEmitter();
```

#### Changing the user agent for requests

```js
const feeder = new RssFeedEmitter({ userAgent: 'Your UA string' });
```

### Adding feeds

```js
feeder.add({
  url: 'http://www.nintendolife.com/feeds/news',
  refresh: 2000
});
```

> Default refresh value is 60 seconds

You can also add multiple at once by either providing an array of urls for the `url` field:
```js
feeder.add({
  url: ['http://www.nintendolife.com/feeds/news', 'http://feeds.bbci.co.uk/news/rss.xml' ],
  refresh: 2000
});
```

or by passing multiple configs:
```js
feeder.add({
  url: 'http://www.nintendolife.com/feeds/news',
  refresh: 2000
}, {
  url: 'http://feeds.bbci.co.uk/news/rss.xml',
  refresh: 5000
});
```

### Listening to new items

```js
feeder.on('new-item', function(item) {
  console.log(item);
})
```

you can also override the default `'new-item'` event name with a new value of your choice by providing the event name in the feed config.
```js
feeder.add({
  url: 'http://www.nintendolife.com/feeds/news',
  refresh: 2000,
  eventName: 'nintendo'
});

feeder.on('nintendo', function(item) {
  console.log(item);
});
```

### Ignoring the first load of items
```js
const feeder = new RssFeedEmitter({ skipFirstLoad: true });

feeder.add({
  url: 'http://www.nintendolife.com/feeds/news',
  refresh: 2000,
  eventName: 'nintendo'
});

// this item will only be from the new items, not from old items.
feeder.on('nintendo', function(item) {
  console.log(item);
});
```

### Listing all feeds in the instance
The list is now an ES6 getter to make the field a bit more plain to access.
```js
feeder.list;
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


## Contributors

| [<img src="https://avatars3.githubusercontent.com/u/7128721?s=400&v=4" width="155"><br><sub>@TobiTenno</sub>](https://github.com/TobiTenno) |
| :---: |

## Author

| [<img src="https://avatars0.githubusercontent.com/u/4248081?v=3&s=115" width="155"><br><sub>@filipedeschamps</sub>](https://github.com/filipedeschamps) |
| :---: |
