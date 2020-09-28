# Relative URL Resolver

This library resolves relative url to absolute url via given base url. Confirming [RFC-1808](https://tools.ietf.org/html/rfc1808).

## Installation

```
$ npm install relative-url-resolver
```

## Usage

```js
const UrlResolver = require('relative-url-resolver');
UrlResolver.resolve(relativeUrl, baseUrl);
```
