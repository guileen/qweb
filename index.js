/**
 * A very very small http server.
 */
var http = require('http');
var parseUrl = require('url').parse;
var domain = require('domain');

var exports = module.exports = function(routes) {
    for(var key in routes) {
        if(/\/$/.test(key)) {
            routes[key.replace(/\/$/, '')] = routes[key];
        } else {
            routes[key + '/'] = routes[key]
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
			var key = (method == 'get') ? urlinfo.pathname : (method + ':' + urlinfo.pathname);
			var route = routes[key] || routes['404'];
			if(route) {
				route(req, res);
			} else {
				res.writeHead(404);
				res.end('Oops, 404 not found.');
			}
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
	return server;
}
// req.urlinfo  see url.parse
// magic code
exports.req = http.IncomingMessage.prototype;
exports.res = http.ServerResponse.prototype;

