//New Relic if not dev
//if(process.env.CVGRAM_STAGE != 'DEV'){ var newrelic = require('newrelic');}

var config = require('./config/config');
var log4js = require('log4js');
var logger = log4js.getLogger('co.mockapi');
var path = require('path');
var express = require('express');

//View routes
var Index = require('./routes/view/index');
var Partials = require('./routes/view/partials');

//API rountes
var Connect = require('./routes/api/connect');
var Project = require('./routes/api/project');

//Require Middleware
var ErrorHandler = require('./middleware/errorHandler');

logger.info('mockapi - app initialization...');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser('mockapi like a sir'));
app.use(express.static(path.join(__dirname, 'public')));
//Session management was moved to security middleware

app.use(app.router);

//Setup the error handler
ErrorHandler(app);

//Bind API routes
Connect(app);
Project(app);

//Bind View routes
Index(app);
Partials(app);

//Create the server
app.listen(app.get('port'), function(){
	logger.info('mockapi - express server listening on port ' + app.get('port') + ' --- ' + config.stage);
});