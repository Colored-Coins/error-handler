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
##### env
Possible values: `'development'` (default) or other environment string.<br>
`'development'` enables including the stack trace as part of the response.

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
