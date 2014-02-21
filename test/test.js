var qweb = require('../index');
var domain = require('domain');
var mock = qweb.mock();
var assert = require('assert');

var caughtError = null;
var server = qweb({
        '/foo/bar': function (req, res) {
            res.end('/foo/bar');
        }
      , 'post:/foo/bar/': function (req, res) {
            res.end('post:/foo/bar/');
        }
      , '/foo/*': function(req, res) {
            res.end('/foo/*:' + req.params[1]);
        }
      , 'post:/foo/*': function(req, res) {
            res.end('post:/foo/*:' + req.params[1]);
        }
      , '/bar/:id': function(req, res) {
            res.end('/bar/:id id=' + req.params.id);
        }
      , 'post:/bar/:id': function(req, res) {
            res.end('post:/bar/:id id=' + req.params.id);
        }
      , '/verb/get': function(req, res) {
            res.end('should not get this');
        }
      , '/throw-error': function(req, res) {
            setTimeout(function(){
                    var err = new Error('fake error');
                    err.code = 'FAKE';
                    throw err;
            }, 50)
        }
}).on('domainError', function(err, req, res){
        caughtError = err;
        res.end('500 server internal error');
}).get('/verb/get', function(req, res) {
        res.end('/verb/get');
}).post('/verb/post', function(req, res) {
        res.end('/verb/post');
});
process.on('uncaughtException', function(err) {
        console.log(err.stack);
        process.exit(1);
})


var exitCode = 0;
process.on('exit', function(err) {
        process.exit(exitCode || err);
})

function asyncTest (msg, fn) {
    var gotError = false;
    var timer = setTimeout(function() {
            throw new Error('Timeout(2000ms)');
    }, 2000);
    function done(err) {
        if(err) {
            exitCode = 1;
            console.error('FAIL with', err.stack || err);
            console.log('FAIL', msg);
        } else {
            console.log('SUCCESS', msg);
        }
        clearTimeout(timer);
    }
    var d = mock.createDomain();
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
function request(req, expectResponse, callback) {
    asyncTest(req.method + ':' + req.url, function(done) {
            var res = mock.response();
            res.on('finish', function(){
                    try{
                        assert.equal(res.sentcontent, expectResponse);
                        callback ? callback(done) : done();
                    } catch(e) {
                        done(e);
                    }
            })
            server.emit('request', req, res);
    })
}

function get(url, expectResponse, callback) {
    request(mock.request(url, 'GET'), expectResponse, callback);
};

function post(url, expectResponse, callback) {
    request(mock.request(url, 'POST'), expectResponse, callback);
}

mock.disableDomain();
get('/verb/get', '/verb/get');
post('/verb/post', '/verb/post');
get('/foo/bar', '/foo/bar');
post('/foo/bar', 'post:/foo/bar/');
get('/foo/1234', '/foo/*:1234');
post('/foo/1234', 'post:/foo/*:1234');
get('/bar/1234', '/bar/:id id=1234');
post('/bar/1234', 'post:/bar/:id id=1234');
get('/blabla', 'Oops, 404 not found.');
mock.enableDomain();
get('/throw-error', '500 server internal error', function(done) {
        assert.equal(caughtError.code, 'FAKE');
        done();
});
