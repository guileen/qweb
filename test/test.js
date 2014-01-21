var qweb = require('../index');
var assert = require('assert');
var mock = require('./mock');

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

function request(req, expectResponse) {
    mock.test(req.method + ':' + req.url, function(done) {
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
