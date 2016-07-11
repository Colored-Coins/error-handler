/* eslint-env mocha */
var errorHandler = require('../index.js')()
var errors = require('cc-errors')
var assert = require('assert')
var request = require('supertest')
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

app.use(bodyParser.json())
app.get('/string_error', function (req, res, next) {
  next('Some Error')
})
app.get('/array_error', function (req, res, next) {
  next(['Some Error', 500])
})
app.get('/cc_error', function (req, res, next) {
  if (!req.query || req.query.explain !== 'true') {
    return next(new errors.InvalidAddressError())
  }
  next(new errors.InvalidAddressError({
    explanation: 'This specific address is invalid'
  }))
})
app.use(errorHandler)

describe('Test error of correct format', function () {
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
          message: 'Invalid Address'
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
					message: 'Invalid Address'
				})
				done()
			})
	})
})
