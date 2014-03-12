qweb
====

<a href="https://travis-ci.org/guileen/qweb"><img src="https://api.travis-ci.org/guileen/qweb.png"></a>

A very simple web framework

<a href="https://nodei.co/npm/qweb/"><img src="https://nodei.co/npm/qweb.png?downloads=true&stars=true"></a>

## install

    npm install qweb --save

## init

    var qweb = require('qweb');
    var server = qweb();

## basic dict route

`qweb({path: handler})`

```js
var server = qweb({
    '/foo': function(req, res) {
        res.end('foo');
    }
});
```

## route with method

Support ALL HTTP Verb like GET, POST, PUT, ...

```js
var server = qweb();
server.get('/foo', function(req, res) {
});

server.post('/foo', function(req, res) {
});
```

## route with named params

```js
qweb().get('/foo/:id', function(req, res) {
        res.end(req.params.id);
});
```

## route or wild-card.

```js
qweb().get('/foo/*', function(req, res) {
        res.end(req.params[0]);
});
```

## req.query

```js
qweb().get('/foo', function(req, res) {
    console.log(req.query);
});
```

## req.res
## res.req

## server.before(function(req, res))

## server.after(function(req, res))

## Event: domainError  function(error, req, res)

## extend request and response.

You can extend request and response method by below method.

```js
qweb.res.json = function(obj) {
    this.writeHead({'Content-Type': 'application/json'});
    this.end(JSON.stringify(obj));
}
```
