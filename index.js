/**
 * A very very small http server.
 */
var http = require('http');
var parseUrl = require('url').parse;
var domain = require('domain');

function default404(req, res) {
    res.writeHead(404);
    res.end('Oops, 404 not found.');
}

var exports = module.exports = function(routes) {
    var regexRoutes = [];
    process.nextTick(function(){
            // init routes and regexRoutes
            for(var key in routes) {
                addRegexRoute(key, routes[key]);
            }
    })

    for(var key in routes) {
        // if not "get:/foo/bar" but "/foo/bar"
        if(!/\w+:.*/.test(key)) {
            var fn = routes[key];
            delete routes[key];
            key = 'get:'+key;
            routes[key] = fn;
        }
    }

    function addRegexRoute(key, fn) {
        if(~key.indexOf('*') || ~key.indexOf('/:')) {
            // /foo/*
            // /foo/:bar
            var names = [];
            var regex = key.replace(/\/(?:([^:\/]+)|\:([^\/]+))/g, function(full, normal, name){
                    if(normal) return full;
                    names.push(name);
                    return '/(.+?)';
            }).replace(/\*/g, '(.*?)').replace(/\//g, '\\/');
            regexRoutes.push([new RegExp('^' + regex + '$'), names, fn]);
            delete routes[key];
        } else {
            // post:/foo/bar
            if(/\/$/.test(key)) {
                routes[key.replace(/\/$/, '')] = fn;
            } else {
                routes[key + '/'] = fn;
            }
        }
    }

    function defineRoute(method, path, fn) {
        var key = method + ':' + path;
        routes[key] = fn;
        addRegexRoute(key, fn);
    }

    function matchRegexRoutes(key, req){
        for (var i = 0, l = regexRoutes.length; i < l; i ++) {
            var v = regexRoutes[i];
            var match = key.match(v[0])
              , names = v[1]
              ;
            if(match) {
                req.params = {};
                for (var j = 1, l = match.length; j < l; j ++) {
                    var name = names[j - 1];
                    var str = match[j];
                    req.params[j] = str;
                    if(name) req.params[name] = str;
                }
                return v[2];
            }
        }
    }

    var beforeHandler, afterHandler;
    var server = http.createServer(function(req, res) {
        var d = domain.create();
        d.on('error', function(err) {
            server.emit('domainError', err, req, res);
        })
        d.add(req);
        d.add(res);
        d.run(function() {
            var method = req.method.toLowerCase();
            var urlinfo = parseUrl(req.url, true);
            req.urlinfo = urlinfo;
            beforeHandler && beforeHandler(req, res);
            afterHandler && res.on('finish', function(){
                afterHandler(req, res);
            });
            var key = method + ':' + urlinfo.pathname;
            var route = routes[key] || matchRegexRoutes(key, req) || routes['404'] || default404;
            route(req, res);
        })
    });

    server.before = function(_beforeHandler) {
        beforeHandler = _beforeHandler;
        return server;
    }

    server.after = function (_afterHandler) {
        afterHandler = _afterHandler;
        return server;
    }
    ;[
        'acl'
      , 'aseline-control'
      , 'checkin'
      , 'checkout'
      , 'connect'
      , 'copy'
      , 'delete'
      , 'get'
      , 'head'
      , 'label'
      , 'lock'
      , 'merge'
      , 'mkactivity'
      , 'mkcol'
      , 'mkworkspace'
      , 'move'
      , 'options'
      , 'orderpatch'
      , 'patch'
      , 'post'
      , 'propfind'
      , 'proppatch'
      , 'put'
      , 'report'
      , 'search'
      , 'trace'
      , 'uncheckout'
      , 'unlock'
      , 'update'
      , 'version-control'].forEach(function(verb) {
            server[verb] = function(path, fn) {
                defineRoute(verb, path, fn);
            }
    });
    return server;
}
// req.urlinfo  see url.parse
// magic code
exports.req = http.IncomingMessage.prototype;
exports.res = http.ServerResponse.prototype;
exports.mock = function() {
    var mock = require('./mock');
    exports.req = mock.MockRequest.prototype;
    exports.res = mock.MockResponse.prototype;
    return mock;
}

