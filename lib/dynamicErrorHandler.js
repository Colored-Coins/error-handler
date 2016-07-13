var DynamicErrorHandler = function (errorHandler) {
  this.errorHandler = errorHandler
}

DynamicErrorHandler.prototype.handler = function () {
  var self = this
  return function handle (err, req, res, next) {
    self.errorHandler(err, req, res, next)
  }
}

DynamicErrorHandler.prototype.replace = function (errorHandler) {
  this.errorHandler = errorHandler
}

module.exports = DynamicErrorHandler
