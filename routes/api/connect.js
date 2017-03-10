var logger = require('log4js').getLogger('co.mockapi');
var config = require('../../config/config');
var _ = require('underscore');

var security = require('../../middleware/security');
var connectService = require('../../service/connectService');

var Exception = require('../../service/model/exception');

//Export the router
module.exports = ConnectRouter;

/**
 *
 * The Authentication endpoint exposes a set of methods for managing authentication.
 */
function ConnectRouter(app){
	app.post('/api/user/signin', security.session, signin);
	app.post('/api/user/signup', security.session, signup);
	app.get('/api/user/signout', security.session, security.restrict, signout);
	app.get('/api/user/self', security.session, security.restrict, aboutMe);
	app.put('/api/user/:id', security.session, security.restrict, put);
};


/**
 * The signIn method returns an authentication token that is associated 
 * with a specific set of user credentials.
 */
function signin(req, res){
	var credentials = req.body; //{email, password}

	logger.info('connect router : signin : about to authenticate user: ', credentials.email);

	connectService.signin(
		credentials.email, 
		credentials.password,
	
		//onSuccess
		function(user){
			if(user) req.session.user = user;
			user = user || new Exception(403, ['Authentication failed for', credentials.email].join(' '));
			logger.info('connect router : signin : user: ', user._id);
			res.send(user);
		},

		//onError
		function(err){
			res.send(err)
		}
	);
};

/**
 * The signIn method returns an authentication token that is associated 
 * with a specific set of user credentials.
 */
function signup(req, res){
	var credentials = req.body;
	logger.info('connect router : signup : about to signup user: ', credentials.email);
	
	try{

		connectService.register(
			credentials, 
	
			//onSuccess
			function(user){
				if(user) req.session.user = user;
				res.send(user);
			},
	
			//onError
			function(err){
				res.send(err)
			}
		);

	}catch(err){
		logger.error('Signup error', err);
		res.send(new Exception(500, 'Signup error', err.message, err));
	}
};

/**
 * To get user details by access token
 */
function aboutMe(req, res){
	logger.info('connect router : aboutMe : about to send user details');
	var user = req.user;
	res.send(user);
};

/**
 * To invalidate access token and revoke user access
 */
function signout(req, res){
	var user = req.user;
	logger.info('connect router : signout : clear user data for current user', user._id);

	try{

		delete req.session.user;
		req.session.destroy();
		res.send({code: 200});

	}catch(err){
		logger.error('Signout error', err);
		res.send(new Exception(500, 'Signout error', err.message, err));
	}
};

/**
 * The put method updates an endUser password
 */
function put(req, res){
	var user = req.user;
	var userId = user._id; //user loggedin user
	var userPlain = req.body;

	logger.info('connect router : put : about to update user password [%s]', userId);

	try{
		connectService.password(
			user,
			userPlain, 

			//onSuccess
			function(user){
				res.send(user);
			},

			//onError
			function(err){
				res.send(err)
			}
		);

	}catch(err){
		logger.error('Change password error', err);
		res.send(new Exception(500, 'Change password error', err.message, err));
	}
};