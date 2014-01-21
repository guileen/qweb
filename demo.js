// demo.js

var qweb = require('./index');
qweb.res.render = function(path, params) {
	var txt = jade.render(path, params);
	this.end(txt);
}

qweb.res.json = function(obj) {
	this.end(JSON.stringify(obj));
}

qweb.req.query = function() {
	this.urlinfo.query;
}

var server = qweb({
	'/foo/*' : function(req, res){
		var query = req.query();
        res.json({hello: 'world'})
    }, 
    '/' : function(req, res){
        res.end('foo');
    }
}).before(function(req, res) {
	console.log(req.method, req.url);
}).after(function(req, res) {
	console.log('done');
}).on('domainError', function(err, req, res) {
	console.error(req.url);
	console.error(err.stack)
});

server.listen(3000);
