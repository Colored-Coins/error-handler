module.exports = function (options) {
  options = options || {}
  var includeStack = options.includeStack || process.env.NODE_ENV === 'development'
  var log = options.log || true
  if (typeof log !== 'function' && typeof log !== 'boolean') {
    throw new TypeError('option log must be function or boolean')
  }
  if (log === true) {
    log = console.error
  }

  return function errorHandler (err, req, res, next) {
    var error
    if (err instanceof Error) {
      error = {}
      for (var prop in err) {
        error[prop] = err[prop]
      }
      if (includeStack) {
        error.stack = err.stack
      }
    } else if (Array.isArray(err)) {
      error = {
        message: err[0],
        status: err[1]
      }
    } else if (typeof err === 'string') {
      console.log('err = ', err)
      error = {
        message: err,
        status: 500
      }
    } else if (typeof err === 'object') {
      error = err
    } else {
      error = {
        message: 'Internal Server Error',
        status: 500
      }
    }

    req.headers && req.headers['request-id'] && (error.requestId = req.headers['request-id'])
    req.headers && req.headers['correlation-id'] && (error.correlationId = req.headers['correlation-id'])
    if (includeStack && !error.stack) {
      error.stack = ''
      Error.captureStackTrace(error, errorHandler)
    }

    log(error)
    res.status(error.status || 500)
    return res.send(error)
  }
}
