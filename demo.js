// demo.js

var qweb = require('./index');
qweb.res.render = function(path, params) {
    var txt = jade.render(path, params);
    this.end(txt);
}

qweb.res.json = function(obj) {
    this.end(JSON.stringify(obj));
}

var server = qweb({
        '/foo/*' : function(req, res){
            res.json({params0: req.params[0]})
        }, 
        '/' : function(req, res){
            res.end('bar=' + req.query.bar);
        }
}).before(function(req, res) {
        console.log(req.method, req.url);
}).after(function(req, res) {
        console.log('done');
}).on('domainError', function(err, req, res) {
        console.error(req.url);
        console.error(err.stack)
});

var port = 3000;
server.listen(port);
console.log('server listen at', port);
