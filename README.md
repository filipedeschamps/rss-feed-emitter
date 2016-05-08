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
    <img src="https://badge.fury.io/js/rss-feed-emitter.svg">
  </a>
</p>

<p align="center">
  Track tons of feeds and receive events for every new item published with this super RSS News Feed aggregator.
</p>


## Tutorial

This is a fully functional module, but its source code and repository are also a **super complete tutorial**, covering:

 1. What to do first when creating a module from scratch
 2. How to manage your module in Github and npm
 3. How to transpile your ES6 code into ES5
 4. How to create automated unit and integration tests
 5. How to integrate them with Travis CI and make the build break if tests didn't pass
 6. How to automatically test your module against various versions of Node.js
 7. How to setup a code coverage tool and keep 100% coverage
 8. How to integrate the coverage results with Code Climate
 9. How to configure linting tools to make your code base consistent
 10. How to deploy to Github and npm with tags and releases

If you're afraid to read the source code of the modules you use or to create your first module, this is the best chance you have to break this barrier :)

**[Start here](https://github.com/filipedeschamps/rss-feed-emitter/issues/119)**


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

#### Changing the user agent for requests

``` js
let feeder = new RssFeedEmitter({ userAgent: 'Your UA string' });
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
