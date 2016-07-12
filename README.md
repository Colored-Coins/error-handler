[![Build Status](https://travis-ci.org/Colored-Coins/error-handler.svg?branch=master)](https://travis-ci.org/Colored-Coins/error-handler) [![Coverage Status](https://coveralls.io/repos/Colored-Coins/error-handler/badge.svg?branch=master)](https://coveralls.io/r/Colored-Coins/error-handler?branch=master) 
# error-handler
Express.js error handling middleware.
## Usage
### Installation
```sh
$ npm install cc-error-handler
```
### Running the tests
```
$ npm install
$ mocha
```
### Connect the middleware
Initialize the error-handler, using `require('cc-error-handler')`.<br>
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
#### Options
##### env
Possible values: `'development'` (default) or other environment string.<br>
`'development'` enables including the stack trace as part of the response.
