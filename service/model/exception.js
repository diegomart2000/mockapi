/**
 * Base exception object
 */
function Exception(code, title, description, serverStackTrace){
	this.code = code;
	this.title = title;
	this.description = description;
	this.serverStackTrace = serverStackTrace;
	this.isException = true;

	return this;
};

Exception.prototype.fromError = function(code, title, description, correlationId, err) {
	this.code = code;
	this.title = title;
	this.description = description;
	this.isException = true;
	this.serverStackTrace = err.stackTrace;	
	this.correlationId = correlationId;
};

Exception.notFound = function(entity, id){
	return new Exception(404, [entity, id,'not found'].join(' '));
};

module.exports = Exception;