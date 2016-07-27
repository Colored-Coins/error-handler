/* eslint-env mocha */
var errorHandler = require('../errorHandler.js')
var DynamicMiddleware = require('dynamic-middleware')
var errors = require('cc-errors')
var assert = require('assert')
var request = require('supertest')
var bodyParser = require('body-parser')
var express = require('express')
var async = require('async')
var app = express()

var placeHolderMiddleware = function (req, res, next) { next() }
var requestIdMiddleware = function (req, res, next) {
  req.headers['request-id'] = 'request-id-1234'
  req.headers['correlation-id'] = 'correlation-id-1234'
  req.headers['remote-id'] = 'remote-id-1234'
  next()
}
var dynamicRequestIdMiddleware = new DynamicMiddleware(placeHolderMiddleware)
var errorHandlerProduction = errorHandler() // default, unless explicitly process.env.NODE_ENV = 'development'
var errorHandlerDevelopment = errorHandler({env: 'development'})
var dynamicErrorHandler = new DynamicMiddleware(errorHandlerProduction)

app.use(dynamicRequestIdMiddleware.handler())
app.use(bodyParser.json())
app.get('/string_error', function (req, res, next) {
  next('Some Error')
})
app.get('/array_error', function (req, res, next) {
  next(['Some Error', 500])
})
app.get('/error', function (req, res, next) {
	next(new Error('Some Error'))
})
app.get('/cc_error', function (req, res, next) {
  if (!req.query || req.query.explain !== 'true') {
    return next(new errors.InvalidAddressError())
  }
  next(new errors.InvalidAddressError({
    explanation: 'This specific address is invalid'
  }))
})
app.use(dynamicErrorHandler.errorHandler())

describe('Test error of correct format - production', function () {
  it('string error', function (done) {
    request(app)
			.get('/string_error')
			.expect(500)
			.end(function (err, res) {
				if (err) return done(err)
				assert.deepEqual(res.body, {
					status: 500,
					message: 'Some Error'
				})
				done()
			})
	})

	it('array error', function (done) {
    request(app)
			.get('/array_error')
			.expect(500)
			.end(function (err, res) {
				if (err) return done(err)
				assert.deepEqual(res.body, {
					status: 500,
					message: 'Some Error'
				})
				done()
			})
	})

	it('raw error', function (done) {
    request(app)
			.get('/error')
			.expect(500)
			.end(function (err, res) {
				if (err) return done(err)
				assert.deepEqual(res.body, {
					status: 500,
					message: 'Internal server error'
				})
				done()
			})
	})

	it('Colored-Coins error', function (done) {
    request(app)
			.get('/cc_error')
			.expect(422)
			.end(function (err, res) {
				if (err) return done(err)
				assert.deepEqual(res.body, {
          name: 'InvalidAddressError',
          code: 10001,
          status: 422,
          message: 'Invalid address'
				})
				done()
			})
	})

	it('Colored-Coins error, with explanation', function (done) {
    request(app)
			.get('/cc_error?explain=true')
			.expect(422)
			.end(function (err, res) {
				if (err) return done(err)
				assert.deepEqual(res.body, {
					name: 'InvalidAddressError',
					code: 10001,
					status: 422,
					explanation: 'This specific address is invalid',
					message: 'Invalid address'
				})
				done()
			})
	})
})

describe('Test error of correct format - development', function () {

	before(function () {
		dynamicErrorHandler.replace(errorHandlerDevelopment)
	})

  it('string error', function (done) {
    request(app)
			.get('/string_error')
			.expect(500)
			.end(function (err, res) {
				if (err) return done(err)
				assert.equal(res.body.status, 500)
				assert.equal(res.body.message, 'Some Error')
				assert.notEqual(res.body.stack, undefined)
				done()
			})
	})

	it('array error', function (done) {
    request(app)
			.get('/array_error')
			.expect(500)
			.end(function (err, res) {
				if (err) return done(err)
				assert.equal(res.body.status, 500)
				assert.equal(res.body.message, 'Some Error')
				assert.notEqual(res.body.stack, undefined)
				done()
			})
	})

	it('raw error', function (done) {
    request(app)
			.get('/error')
			.expect(500)
			.end(function (err, res) {
				if (err) return done(err)
				assert.equal(res.body.status, 500)
				assert.equal(res.body.message, 'Internal server error')
				assert.notEqual(res.body.original, undefined)
				done()
			})
	})

	it('Colored-Coins error', function (done) {
    request(app)
			.get('/cc_error')
			.expect(422)
			.end(function (err, res) {
				if (err) return done(err)
				assert.equal(res.body.status, 422)
				assert.equal(res.body.name, 'InvalidAddressError')
				assert.equal(res.body.code, 10001)
				assert.equal(res.body.message, 'Invalid address')
				assert.notEqual(res.body.stack, undefined)
				done()
			})
	})

	it('Colored-Coins error with explanation', function (done) {
    request(app)
			.get('/cc_error?explain=true')
			.expect(422)
			.end(function (err, res) {
				if (err) return done(err)
				assert.equal(res.body.status, 422)
				assert.equal(res.body.name, 'InvalidAddressError')
				assert.equal(res.body.code, 10001)
				assert.equal(res.body.message, 'Invalid address')
				assert.equal(res.body.message, 'Invalid address')
				assert.equal(res.body.explanation, 'This specific address is invalid')
				assert.notEqual(res.body.stack, undefined)
				done()
			})
	})

  it('Colored-Coins error with request-id, correlation-id and remote-id', function (done) {
    dynamicRequestIdMiddleware.replace(requestIdMiddleware)
    request(app)
      .get('/cc_error?explain=true')
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        assert.equal(res.body.status, 422)
        assert.equal(res.body.name, 'InvalidAddressError')
        assert.equal(res.body.code, 10001)
        assert.equal(res.body.message, 'Invalid address')
        assert.equal(res.body.message, 'Invalid address')
        assert.equal(res.body.explanation, 'This specific address is invalid')
        assert.equal(res.body.requestId, 'request-id-1234')
        assert.equal(res.body.correlationId, 'correlation-id-1234')
        assert.equal(res.body.remoteId, 'remote-id-1234')
        assert.notEqual(res.body.stack, undefined)
        done()
      })
  })

  it('Colored-Coins error with request-id, correlation-id and remote-id', function (done) {
    dynamicRequestIdMiddleware.replace(requestIdMiddleware)
    request(app)
      .get('/cc_error?explain=true')
      .expect(422)
      .end(function (err, res) {
        if (err) return done(err)
        assert.equal(res.body.status, 422)
        assert.equal(res.body.name, 'InvalidAddressError')
        assert.equal(res.body.code, 10001)
        assert.equal(res.body.message, 'Invalid address')
        assert.equal(res.body.message, 'Invalid address')
        assert.equal(res.body.explanation, 'This specific address is invalid')
        assert.equal(res.body.requestId, 'request-id-1234')
        assert.equal(res.body.correlationId, 'correlation-id-1234')
        assert.equal(res.body.remoteId, 'remote-id-1234')
        assert.notEqual(res.body.stack, undefined)
        done()
      })
  })

  it('requestId is carried from the error-initiator', function (done) {
  	this.timeout(5000)
		var requestIdMiddleware = require('cc-request-id')
		var portfinder = require('portfinder')
		var httpClient = require('request')
		var port
		var app1 = express()
		app1.use(requestIdMiddleware({namespace: 'app1', secret: '1234'}))
		app1.get('/', function (req, res, next) {
			next(new Error())
		})
		app1.use(errorHandler())

		var app2 = express()
		app2.use(requestIdMiddleware({namespace: 'app2', secret: '1234'}))
		app2.get('/', function (req, res, next) {
			httpClient('http://localhost:' + port + '/', function (err, response, body) {
				if (err) return next(err)
				if (response.statusCode) return next(JSON.parse(response.body))
				res.status(200).end()
			})
		})
		app2.use(errorHandler())

		async.waterfall([
			function (cb) {
				portfinder.getPort(cb)
			},
			function (firstPort, cb) {
				port = firstPort
				app1.listen(port, cb)
			}
		],
		function (err, cb) {
			if (err) return done(err)
			request(app2)
				.get('/')
				.expect(500)
				.end(function (err, res) {
					if (err) return done(err)
					assert.equal(res.body.requestId.substring(0, 'app1'.length), 'app1')
					assert.equal(res.body.correlationId.substring(0, '/-app2'.length), '/-app2')
					done()
				})
		})
	})
})
