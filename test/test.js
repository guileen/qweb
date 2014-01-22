var qweb = require('../index');
var domain = require('domain');
var mock = qweb.mock();
var assert = require('assert');

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
}).on('domainError', function(err, req, res){
        throw err;
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
function request(req, expectResponse) {
    asyncTest(req.method + ':' + req.url, function(done) {
            var res = mock.response();
            res.on('finish', function(){
                    try{
                        assert.equal(res.sentcontent, expectResponse);
                        done();
                    } catch(e) {
                        done(e);
                    }
            })
            server.emit('request', req, res);
    })
}

function get(url, expectResponse) {
    request(mock.request(url, 'GET'), expectResponse);
};

function post(url, expectResponse) {
    request(mock.request(url, 'POST'), expectResponse);
}

get('/foo/bar', '/foo/bar');
post('/foo/bar', 'post:/foo/bar/');
get('/foo/1234', '/foo/*:1234');
post('/foo/1234', 'post:/foo/*:1234');
get('/bar/1234', '/bar/:id id=1234');
post('/bar/1234', 'post:/bar/:id id=1234');
get('/blabla', 'Oops, 404 not found.');
