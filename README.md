[![Build Status](https://travis-ci.org/Colored-Coins/error-handler.svg?branch=master)](https://travis-ci.org/Colored-Coins/error-handler)
[![Coverage Status](https://coveralls.io/repos/github/Colored-Coins/error-handler/badge.svg?branch=master)](https://coveralls.io/github/Colored-Coins/error-handler?branch=master)
[![npm version](https://badge.fury.io/js/cc-error-handler.svg)](https://badge.fury.io/js/cc-error-handler)
# error-handler
Express.js error handling middleware.
## Installation
```sh
$ npm install cc-error-handler
```
## Running the tests
```
$ npm install
$ mocha
```
## API
```javascript
var errorhandler = require('cc-error-handler')
```
### errorhandler(options)
Create new error handling middleware.
#### options
##### includeStack
Should the error object include stack trace.<br>
Default is `false`, unless `NODE_ENV=development`
##### log
One of two types:
* boolean - a boolean for determining whether the error handler should log the error messages. `true` will use `console.error` by default for logging.
* function - a function to process an error, invoked with `err`.<br>
Default is `true`.

## Example
As with any express error handling middleware, it should be put after the router middleware:
```javascript
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var errorHandler = require('cc-error-handler')

app.use(bodyParser())
app.get('/error', function (req, res, next) {
	next('Something went wrong')
})
app.use(errorHandler())
```
