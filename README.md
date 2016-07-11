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
Initialize the error-handler, using `require('cc-error-handler')`.
As with any express error handling middleware, it should be put after the router middleware:
```javascript
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var errorHandler = require('cc-error-handler')()

app.use(bodyParser())
app.get('/error', function (req, res, next) {
	next('Something went wrong')
})
app.use(errorHandler)
```