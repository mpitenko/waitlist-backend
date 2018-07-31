var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')

var CONFIG = require('./config.json');


/*
 * Routes
 */
var router = express.Router();

router.get('/', function (req, res) {
  res.end('It Works!');
});

router.post('/admin/login', function(req ,res) {
	console.log('login!!');
});

/*
 * End Routes
 */


/*
 * App
 */
var app = express();

// set public directory

app.use(cookieParser())

// connect request body parser to parse data from POST requests
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

// request logger (for all requests)
app.use(function logger(req, res, next) {
  console.log(req.method, req.url);
  next();
});

// connect routes
app.use(router);

// error logger if a route not found in routes above
app.use(function loggerError(req, res, next) {
  console.error('Error 404:', req.method, req.url);
  res.status(404);
  res.send('Not Found');
});

// run server process
app
  .listen(CONFIG.port, function onServerStart() {
    console.log('');
    console.log('Server running on: http://localhost:' + CONFIG.port);
    console.log('To shut down server, press <CTRL> + C at any time.');
    console.log('');
  });
/*
 * End App
 */
