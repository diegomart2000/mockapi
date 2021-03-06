module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		bower: {
			install: {}
		},

		concat: {
			options: {
				separator: ';'
			},
			base: {
				src: [
					'lib/jquery/jquery.js',
					'lib/bootstrap/bootstrap.js',
					'lib/underscore/underscore.js',
					'lib/backbone/backbone.js',
					'lib/handlebars/handlebars.js',
					'lib/moment/moment.js',
					'lib/codemirror/codemirror.js',
					'bower_components/codemirror/mode/javascript/javascript.js',
					'bower_components/codemirror/mode/htmlmixed/htmlmixed.js'	
				],

				dest: 'public/js/vendor-bundle.js'
			}
		},

		cssmin: {
			target: {
				options: {
					banner: '/*! <%= pkg.name %> 0.0.1 Styles */\n'
				},

				files: {
					'public/css/vendor-bundle.css': ['lib/animate.css/animate.css', 'lib/bootswatch/index.css', 'lib/codemirror/codemirror.css'],
				}
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> */\n'
			},
			dist: {
				files: {
					'public/js/vendor-bundle-min.js': ['<%= concat.base.dest %>'],
				}
			}
		},

		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: 'lib/requirejs/',
						src: 'require.js',
						dest: 'public/js/',
					},
					{
						expand: true,
						cwd: 'bower_components/glyphicons/',
						src: 'fonts/*',
						dest: 'public/',
					}
				]
			}
		},

		stylus: {
			compile: {
				options: {
					banner: '/*! <%= pkg.name %> 0.0.1 Styles */\n'
				},

				files: {
					'public/css/mockapi.css': 'style/mockapi.styl' // 1:1 compile
				}
			}
		},

		clean: {
			vendor: ['lib/', 'bower_components/']
		},
	});


	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['bower', 'cssmin', 'stylus', 'concat', 'uglify', 'copy', 'clean']);
};