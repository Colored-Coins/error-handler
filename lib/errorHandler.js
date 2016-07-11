function createError (err, req) {
  var requestId = req.headers['request-id'] // TODO - make header name configurable
  if (Array.isArray(err)) {
    err = {
      message: err[0],
      status: err[1]
    }
  } else if (typeof err === 'string') {
    err = {
      message: err,
      status: 500
    }
  }
  if (err && typeof err === 'object' && requestId) {
    err.requestId = requestId
  }
  console.error(err)
  return err
}

module.exports = function () {
  return function (err, req, res, next) {
    var parsedError = createError(err, req)
    res.status(parsedError.status || 500)
    return res.send(parsedError)
  }
}
