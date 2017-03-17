//App View
define([
		"../model/project_model",
		"../collection/project_collection",

		"./spinner_view",
		"./project_list_view"
	], 
	function(
		ProjectModel,
		ProjectCollection,

		SpinnerView,
		ProjectListView
	){

	var AppView = Backbone.View.extend({
		el: 'body',

		initialize: function(options) {
			_.bindAll(this, 'render');

			this.collection = new ProjectCollection();

			//Initialize the spinner
			this.spinner = new SpinnerView();
			this.projectList = new ProjectListView({collection: this.collection});

			this.collection.fetch();
			this.render();
		},

		render: function() {
			MockApi.Events.trigger('m.spinner.hide');
		}
	});

	return AppView;
});