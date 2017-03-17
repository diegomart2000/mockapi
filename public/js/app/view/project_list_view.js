define([
		"./project_view"
	], function(
		ProjectView
	){
	var ProjectsListView = Backbone.View.extend({
		el: '#projects-list',
		emptyTemplate: Handlebars.compile($('#projects-empty-template').html()),

		initialize: function(options) {
			this.collection = options.collection;

			// Ensure our methods keep the `this` reference to the view itself
			_.bindAll(this, 'render', 'add');

			// Bind collection changes to re-rendering
			//this.collection.bind('reset', this.render);
			this.collection.bind('fetch', this.render);
			this.collection.bind('add', this.add);
		},

		render: function(){
			this.$el.empty();

			if(!this.collection.isEmpty()){
				this.collection.each(function(project){
					var projectView = new ProjectView({ model: project });
					this.$el.append(projectView.render().el);
				}, this);
			}else{
				this.$el.append(this.emptyTemplate());
			}

			return this;
		},

		add: function(project){
			this.$el.find('.empty').hide();

			var projectView = new ProjectView({ model: project });
			this.$el.append(projectView.render().el);
		}

	});

	return ProjectsListView;
});