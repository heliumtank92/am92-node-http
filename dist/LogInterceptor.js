"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _http = _interopRequireDefault(require("http"));
var _apiLogger = _interopRequireWildcard(require("@am92/api-logger"));
var _DEBUG = _interopRequireDefault(require("./DEBUG.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var LogInterceptor = {
  request: [requestSuccess, requestError],
  response: [responseSuccess, responseError]
};
var _default = LogInterceptor;
exports.default = _default;
function requestSuccess(config) {
  _logRequest(config);

  // To Generate TimeStamp
  config.timestamp = new Date().getTime();
  return config;
}
function requestError(error) {
  _logRequestError(error);
  throw error;
}
function responseSuccess(response) {
  _logResponse(response);
  return response;
}
function responseError(error) {
  var {
    response
  } = error;
  if (response) {
    _logResponseError(error);
  } else {
    _logRequestError(error);
  }
  throw error;
}
function _logRequest() {
  return _logRequest2.apply(this, arguments);
}
function _logRequest2() {
  _logRequest2 = _asyncToGenerator(function* () {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var {
      url = '',
      method = '',
      headers = {},
      data = {},
      disableBodyLog
    } = config;
    var axiosRetry = config['axios-retry'];
    var message = "[NodeHttpRequest] ".concat(method, " ").concat(url);
    var logObject = {
      type: 'NODE_HTTP',
      message,
      req: {
        httpVersion: '',
        ipAddress: '',
        url,
        method,
        headers,
        body: !disableBodyLog && data || ''
      }
    };
    _apiLogger.httpLogger.trace(logObject);
    if (!axiosRetry && _DEBUG.default.enableDevLogs) {
      var devLogObj = {
        url,
        method,
        data
      };
      _apiLogger.default.debug('Dev: [NodeHttpRequest]', JSON.stringify(devLogObj, null, 2));
    }
  });
  return _logRequest2.apply(this, arguments);
}
function _logResponse(_x) {
  return _logResponse2.apply(this, arguments);
}
function _logResponse2() {
  _logResponse2 = _asyncToGenerator(function* (response) {
    var {
      status: statusCode,
      headers = {},
      data = {},
      config = {}
    } = response;
    var {
      method = '',
      url = '',
      disableBodyLog,
      timestamp
    } = config;
    var status = _http.default.STATUS_CODES[statusCode];
    var now = new Date().getTime();
    var msg = "[NodeHttpResponse] | ".concat(method, " ").concat(url, " | ").concat(statusCode, " ").concat(status);
    var logObject = {
      type: 'NODE_HTTP',
      message: msg,
      res: {
        statusCode,
        status,
        headers,
        body: !disableBodyLog && data || '',
        responseMessage: '',
        responseTime: now - timestamp
      }
    };
    _apiLogger.httpLogger.success(logObject);
    if (_DEBUG.default.enableDevLogs) {
      var devLogObj = {
        statusCode,
        status,
        data
      };
      _apiLogger.default.success('Dev: [NodeHttpResponse]', JSON.stringify(devLogObj, null, 2));
    }
  });
  return _logResponse2.apply(this, arguments);
}
function _logRequestError() {
  return _logRequestError2.apply(this, arguments);
}
function _logRequestError2() {
  _logRequestError2 = _asyncToGenerator(function* () {
    var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var {
      message = '',
      config = {}
    } = error;
    var {
      url = '',
      method = '',
      headers = {},
      data,
      disableBodyLog
    } = config;
    var msg = "[NodeHttpRequestError] ".concat(method, " ").concat(url, " | ").concat(message);
    var logObject = {
      type: 'NODE_HTTP',
      message: msg,
      req: {
        httpVersion: '',
        ipAddress: '',
        url,
        method,
        headers,
        body: !disableBodyLog && data || ''
      }
    };
    _apiLogger.httpLogger.error(logObject);
  });
  return _logRequestError2.apply(this, arguments);
}
function _logResponseError(_x2) {
  return _logResponseError2.apply(this, arguments);
}
function _logResponseError2() {
  _logResponseError2 = _asyncToGenerator(function* (error) {
    var {
      config = {},
      response = {}
    } = error;
    var {
      status: statusCode,
      headers = {},
      data = {}
    } = response;
    var {
      method = '',
      url = '',
      disableBodyLog
    } = config;
    var status = _http.default.STATUS_CODES[statusCode];
    var msg = "[NodeHttpResponseError] | ".concat(method, " ").concat(url, " | ").concat(statusCode, " ").concat(status);
    var logObject = {
      type: 'NODE_HTTP',
      message: msg,
      res: {
        statusCode,
        status,
        headers,
        body: !disableBodyLog && data || '',
        responseMessage: '',
        responseTime: -1 // TODO: Handle Request Time Setting
      }
    };

    _apiLogger.httpLogger.error(logObject);
    if (_DEBUG.default.enableDevLogs) {
      var devLogObj = {
        statusCode,
        status,
        data
      };
      _apiLogger.default.error('Dev: [NodeHttpResponseError]', JSON.stringify(devLogObj, null, 2));
    }
  });
  return _logResponseError2.apply(this, arguments);
}