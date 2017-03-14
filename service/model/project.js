var validate = require('jsonschema').validate;
var _ = require('underscore');

// Prject schema validation
var schema = require('./schema/project.json');

/**
 * Project class
 */
function Project() {
	this._id = null;
	this.userId = null; //The owner userId

	this.readme = null;
	this.description = null;
	this.resources = null;

	return this;
};

/**
 * To fill the instance based on the values of the given site plain object
 */
Project.prototype.fill = function(plain) {
	this._id = plain._id; //the subdomain will be our id, since it should be unique
	this.description = plain.description;
	this.readme = plain.readme;
	this.resources = plain.resources;

	return this;
};

/**
 * To validate this values against schema
 */
Project.prototype.valid = function() {
	var result = validate(this, schema);
	if (!result.valid) {
		this.result = result;
		this.result.message = result.errors.join('\n');
	}

	return result.valid;
};

/**
 * Returns an update version of the object, containing changed fields only
 */
Project.prototype.getUpdate = function() {
	var updatables = _.pick(
		this,
		'description',
		'readme',
		'resources'
	);

	updatables = _.omit(updatables, function(value, key, object) {
		return _.isUndefined(value);
	});

	return updatables;
};

module.exports = Project;