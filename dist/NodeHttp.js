"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _axiosRetry = _interopRequireDefault(require("axios-retry"));
var _LogInterceptor = _interopRequireDefault(require("./LogInterceptor.js"));
var _NodeHttpError = _interopRequireDefault(require("./NodeHttpError.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }
var DEFAULT_CONFIG = {
  retryDelay: _axiosRetry.default.exponentialDelay
};
var _useDefaultInterceptors = /*#__PURE__*/new WeakSet();
class NodeHttp {
  constructor() {
    var CONFIG = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classPrivateMethodInitSpec(this, _useDefaultInterceptors);
    // Configurations
    var config = _objectSpread(_objectSpread({}, DEFAULT_CONFIG), CONFIG);

    // Create Axios Instance & Attach Axios Retry
    this.client = _axios.default.create(config);
    (0, _axiosRetry.default)(this.client, config);

    // Use Request & Response Interceptors to Axios Client
    this.useRequestInterceptor = this.useRequestInterceptor.bind(this);
    this.useResponseInterceptor = this.useResponseInterceptor.bind(this);

    // Eject Request & Response Interceptors to Axios Client
    this.ejectRequestInterceptor = this.ejectRequestInterceptor.bind(this);
    this.ejectResponseInterceptor = this.ejectResponseInterceptor.bind(this);

    // Use Default Interceptors
    _classPrivateMethodGet(this, _useDefaultInterceptors, _useDefaultInterceptors2).call(this);

    // Bind Functions
    this.request = this.request.bind(this);
  }
  request() {
    var _arguments = arguments,
      _this = this;
    return _asyncToGenerator(function* () {
      var options = _arguments.length > 0 && _arguments[0] !== undefined ? _arguments[0] : {};
      try {
        var response = yield _this.client.request(options);
        return response;
      } catch (error) {
        var {
          message,
          response: _response,
          request,
          config
        } = error;
        if (_response) {
          var {
            status = 500,
            data: body
          } = _response;
          var {
            statusCode,
            message: _message,
            data,
            error: err
          } = body;
          var e = err || body;
          var eMap = {
            statusCode: statusCode || status,
            message: _message || error.message,
            errorCode: 'NODE_HTTP::RESPONSE',
            data
          };
          throw new _NodeHttpError.default(e, eMap);
        }
        if (request) {
          var _eMap = {
            message,
            errorCode: 'NODE_HTTP::REQUEST'
          };
          throw new _NodeHttpError.default(config, _eMap);
        }
        throw new _NodeHttpError.default(error);
      }
    })();
  }
  useRequestInterceptor() {
    var interceptor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    if (interceptor.length) {
      return this.client.interceptors.request.use(...interceptor);
    }
  }
  useResponseInterceptor() {
    var interceptor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    if (interceptor.length) {
      return this.client.interceptors.response.use(...interceptor);
    }
  }
  ejectRequestInterceptor(index) {
    this.client.interceptors.request.eject(index);
  }
  ejectResponseInterceptor(index) {
    this.client.interceptors.response.eject(index);
  }
}
exports.default = NodeHttp;
function _useDefaultInterceptors2() {
  this.useRequestInterceptor(_LogInterceptor.default.request);
  this.useResponseInterceptor(_LogInterceptor.default.response);
}