// mock.js
var domain = require('domain');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function noop() {};

function MockRequest(url, method, header) {
    EventEmitter.call(this);
    this.url = url;
    this.method = (method || 'GET').toUpperCase();
}
util.inherits(MockRequest, EventEmitter);

function MockResponse() {
    EventEmitter.call(this);
    this.sentcontent = '';
}

util.inherits(MockResponse, EventEmitter);

MockResponse.prototype.write = function(data) {
    this.sentcontent += data;
}

MockResponse.prototype.end = function (data) {
    this.write(data);
    this.emit('finish');
}

MockResponse.prototype.writeHead = noop;

exports.socket = function() {
    var sock = new EventEmitter();
    sock.write = sock.destroy = sock.setNoDelay = noop;
    return sock;
}

exports.request = function(url, method, header) {
    return new MockRequest(url, method, header);
}

exports.response = function() {
    return new MockResponse();
}

exports.MockRequest = MockRequest;
exports.MockResponse = MockResponse;

var domain = require('domain');
var rawCreate = domain.create;
exports.createDomain = rawCreate;
exports.disableDomain = function () {
    domain.create = function () {
        return {
            add: noop
          , on: noop
          , run: function(fn) {fn()}
        }
    }
}

exports.enableDomain = function enableDomain() {
    domain.create = function() {
        return rawCreate();
    };
}
