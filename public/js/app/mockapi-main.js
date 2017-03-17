//Main App object
var MockApi = {};

//Helper to draw the resource method name
Handlebars.registerHelper('resource-method', function() {
	var method = this.method;
	console.log(method);
	var methodMap = {
		GET: "text-success",
		POST: "text-info",
		PUT: "text-warning",
		DEL: "text-danger"
	};
	var el = $(document.createElement('small'))
		.addClass(methodMap[method])
		.text(method);

	return new Handlebars.SafeString(el[0].outerHTML);
});

//Helper to draw the project name
Handlebars.registerHelper('project-name', function() {
	var _id = this._id;

	var el = $(document.createElement('h5'))
		.addClass('pull-left');

	if (_id.match(/^public\-/)) {
		$(document.createElement('em')).text('public-').appendTo(el);
		_id = _id.replace(/^public\-/, '');
	}

	el.append(_id);
	return new Handlebars.SafeString(el[0].outerHTML);
});


//Application Start
require(["./view/app_view"], function(AppView) {
	console.log('Inspect this 8====D bitch!');

	MockApi.Events = {};
	_.extend(MockApi.Events, Backbone.Events);

	new AppView();

	CodeMirror.fromTextArea($('#code')[0], {
		matchBrackets: true,
		lineNumbers: true,
		styleActiveLine: true,
		mode: {
			name: "javascript",
			json: true
		}
	});

	CodeMirror.fromTextArea($('#code-request')[0], {
		matchBrackets: true,
		lineNumbers: true,
		styleActiveLine: true,
		mode: {
			name: "javascript",
			json: true
		}
	});

	//var collection = new ProjectCollection();
	//collection.create({_id: "new", resources: [{name: "My Endpoint", method:"GET", path: "/mys"}]}, {type: 'POST'});
	//collection.remove({_id: "new"}).destroy();
	//new ProjectModel({_id: "new"}).fetch();
	//collection.get('new');

});