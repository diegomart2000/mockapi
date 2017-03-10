var validate = require('jsonschema').validate;
var _ = require('underscore');

// User schema
var schema = {
	type: "object",
	properties: {
		email: {type: "string", required: true},
		password: {type: "string", required: true},
		first: {type: "string", required: true},
		last: {type: "string", required: true},
		display: {type: "string"},
		picture: {type: "string"}
	}
};

/**
 * User Object Model
 */
function User() {
	this.email = null;
	this.password = null;
	this.first = null; 
	this.last = null;
	this.picture = null;
	this.display = null;

	this.tutorial = null;

	this.roles = null;

	return this;
};
 
/**
 * To fill the instance based on the values of the given spark plain object
 * @param sparkPlain
 */
User.prototype.fill = function(plainUser){
	this.email = plainUser.email ? plainUser.email.toLowerCase() : null;
	this.password = plainUser.password;
	this.first = plainUser.first;
	this.last = plainUser.last;
	this.display = plainUser.display;
	this.picture = plainUser.picture;

	this.roles = plainUser.roles;
return this;
};

/**
 * To validate this values against schema
 */
User.prototype.valid = function(){
	var result = validate(this, schema);
	if(!result.valid){
		this.result = result;
		this.result.message = result.errors.join('\n');
	}

	return result.valid;
};

/**
 * Returns an update version of the object, containing changed fields only
 */
User.prototype.getUpdate = function(){
	var updatables = _.pick(
		this,
		'email',
		'first',
		'last',
		'picture',
		'display',
		'roles'
	);

	updatables = _.omit(updatables, function(value, key, object) {
		return _.isNull(value) || _.isUndefined(value);
	});

	return updatables;
};

module.exports = User;