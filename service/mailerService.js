/**
 * Account administration service
 */
var logger = require('log4js').getLogger('co.mockapi');
var config = require('../config/config');
var fs = require('fs');
var jade = require('jade');
var rest = require('restler');

//mailer globlas
var templates = {
	welcome: jade.compile(fs.readFileSync('./views/mails/welcome.jade','utf8'), {filename: './views/mails/welcome.jade'}),
	verify: jade.compile(fs.readFileSync('./views/mails/verify.jade','utf8'), {filename: './views/mails/verify.jade'}),
	password: jade.compile(fs.readFileSync('./views/mails/password.jade','utf8'), {filename: './views/mails/password.jade'})
};

/**
 * Sends the welcome email.
 */
exports.sendWelcome = function(user){
	logger.info('mailer service : sendWelcome : about to send mail for : ' + user.email);
	
	try{
		var body = {
			  subject: 'Bienvenido a GoSitio!',
			  template: 'welcome',
			  locals: user
			};
		
		new Message(config.mail.from, user.email, body)
				.compose()
				.send(function(err, data){
					if(data) console.log(data);
				});
	}catch(err){
		logger.error('mailer service : sendWelcome : error while sending mail ' + user._id, err);
		onError(err);
	}

	logger.info('mailer service : sendWelcome : for mailer execution');
};


/**
 * Sends the email address verification message.
 */
exports.sendVerifyEmail = function(user){
	logger.info('mailer service : sendVerifyEmail : about to send mail for : ' + user.email);
	
	try{
		var body = {
			  subject: 'Activar mail de contacto',
			  template: 'verify',
			  locals: user
			};
		
		new Message(config.mail.from, user.email, body)
				.compose()
				.send(function(err, data){
					if(data) console.log(data);
				});
	}catch(err){
		logger.error('mailer service : sendVerifyEmail : error while sending mail ' + user._id, err);
		onError(err);
	}

	logger.info('mailer service : sendVerifyEmail : for mailer execution');
};

/**
 * Sends the email address verification message.
 */
exports.sendChangePassword = function(event){
	logger.info('mailer service : sendChangePassword : about to send mail for [%s]', event.user.email);
	
	try{
		var body = {
			  subject: 'Solicitud de cambio de contrase\u00f1a',
			  template: 'password',
			  locals: event
			};
		
		new Message(config.mail.from, event.user.email, body)
				.compose()
				.send(function(err, data){
					if(data) console.log(data);
				});
	}catch(err){
		logger.error('mailer service : sendChangePassword : error while sending mail [%s]', event.user.email, err);
		onError(err);
	}

	logger.info('mailer service : sendChangePassword : for mailer execution');
};

/**
 * Sends the email when the user has deleted her account.
 */
exports.sendUserDeleted = function(user){
	logger.info('mailer service : sendUserDeleted : about to send mail for [%s]', user.deletedEmail);
	
	try{
		var body = {
			  subject: 'Usuario eliminado',
			  text: user.deletedEmail + ' ha eliminado su cuenta.',
			  locals: user
			};
		
		new Message(config.mail.from, 'deleted@doclet.com', body)
				.compose()
				.send(function(err, data){
					if(data) console.log(data);
				});
	}catch(err){
		logger.error('mailer service : sendUserDeleted : error while sending mail [%s]', 'deleted@doclet.com', err);
		onError(err);
	}

	logger.info('mailer service : sendUserDeleted : for mailer execution');
};

/**
 * The message class
 */
function Message(_from, _to, _body){
	this.from = _from;
	this.to = _to;
	this.body = _body;
	
	/**
	 * To actually send the message
	 */
	this.send = function(callback){
		if(!this.body) if(callback) callback('There is no body defined for this message');
		
		rest.post(['https://api.mailgun.net/v2', config.mail.domain, 'messages'].join('/'),{
			  username: 'api',
			  password: config.mail.key,
			  data: this.body
		}).on('complete', function(data) {
			if(callback) callback(null, data);
		});
		
		return this;
	};
	
	/**
	 * Builds the message based on parameters
	 */
	this.compose = function(){
		if(!this.body) return this;
		
		var body = this.body;
		
		//check is it is a template
		if(body.template){
			body.html = templates[body.template](body.locals);
			
			//remove some values to prevent errors on mailgun since some are reserved words
			delete body.template;
			delete body.locals;
		}
		
		body.from = this.from;
		body.to = this.to;
		return this;
	};
};