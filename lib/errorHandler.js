function createError (err, req, includeStack) {
  var error
  var requestId = req.headers['request-id']
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

  if (requestId) {
    error.requestId = requestId
  }
  if (includeStack && !error.stack) {
    error.stack = ''
    Error.captureStackTrace(error, createError)
  }

  console.error(error)
  return error
}

module.exports = function (env) {
  env = env || 'development'
  return function (err, req, res, next) {
    var parsedError = createError(err, req, env === 'development')
    res.status(parsedError.status || 500)
    return res.send(parsedError)
  }
}
