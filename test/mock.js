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

exports.apiRequest = function(url, data) {
    var dataparams = encodeURIComponent(JSON.stringify(data));
    url += (url.indexOf('?') >=0 ? '&' : '?') + 'dataparams=' + dataparams;
    return exports.request(url);
}

exports.request = function(url, method, header) {
    return new MockRequest(url, method, header);
}

exports.response = function() {
    return new MockResponse();
}

exports.MockRequest = MockRequest;
exports.MockResponse = MockResponse;

var exitCode = 0;
process.on('exit', function() {
        process.exit(exitCode);
})
exports.test = function (msg, fn) {
    var gotError = false;
    var timer = setTimeout(function() {
            throw new Error('Timeout(2000ms)');
    }, 2000);
    function done(err) {
        if(err) {
            exitCode = 1;
            console.error(err.stack || err);
            console.log('FAIL', msg);
        } else {
            console.log('SUCCESS', msg);
        }
        clearTimeout(timer);
    }
    var d = domain.create();
    d.add(timer);
    d.on('error', function(err) {
            done(err);
    })
    d.run(function() {
            process.nextTick(function(){
                    fn(done);
            })
    })
}
