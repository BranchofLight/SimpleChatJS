module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
      type: "debug", // 'debug' or 'release'
    },
    concat: {
      options: {
        seperator: ',',
      },
      dist: {
        files: {
          "site-assets/client-<%= dirs.type %>.js": ['src/client*.js'],
          "site-assets/server-<%= dirs.type %>.js": ['src/server*.js'],
        },
      },
    },
    watch: {
      files: ['src/*.js'],
      tasks: ['lint', 'concat'],
    },
    jshint: {
      src: ['Gruntfile.js', 'src/client*.js', 'src/server*.js'],
      // beforeconcat: ['src/client*.js', 'src/server*.js'],
      // afterconcat: ['site-assets/client-debug.js', 'site-assets/server-debug.js'], // Do not lint ugly release
    },
    uglify: {
      my_target: {
        files: {
          // Keep release only as debug is more useful non-ugly
          'site-assets/client-release.js': ['src/client*.js'],
          'site-assets/server-release.js': ['src/server*.js']
        }
      }
    }
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  // Load the plugin that provides the "watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'jshint', 'uglify']);
  // Non-default task(s)
  grunt.registerTask('wat', ['watch']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('cat', ['concat']);
  grunt.registerTask('ugly', ['uglify']);
};
