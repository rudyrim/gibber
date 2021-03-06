const gulp        = require( 'gulp' ),
      buffer      = require( 'vinyl-buffer' ),
      uglify      = require( 'gulp-uglify' ),
      watchify    = require( 'watchify' ),
      browserify  = require( 'browserify' ),
      source      = require('vinyl-source-stream'),
      fs          = require( 'fs' )

gulp.task( 'client', function(){
  //var out = gulp.src( './js/audio.js' )//gulp.src( './node_modules/gibber.core.lib/scripts/gibber.js')
  const out = browserify() //, transform:['glslify'] })
    .require( './playground/environment.js', { entry: true })
    .bundle()
    .on( 'error', console.log )
    .pipe( source( 'bundle.js' ) )
    .pipe( gulp.dest( './playground' ) )
/*    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.audio.lib.min.js') )
    .pipe( gulp.dest('./build/') )
*/    
    return out
});

gulp.task('watch', function() {
  var bundler = watchify( browserify('./playground/environment.js', { entry:true } ) );

  bundler.on('update', rebundle);

  function rebundle() {
    const date = new Date()
    console.log("recompiling... ", date.getHours(), date.getMinutes(), date.getSeconds() )
    return bundler.bundle()
      // log errors if they happen
      .on( 'error', console.log ) 
      .pipe( source( 'bundle.js' ) )
      .pipe( gulp.dest( './playground/' ) )
      // .pipe( uglify() )
      // .pipe( rename('gibber.audio.lib.min.js') )
      // .pipe( gulp.dest('./build/') )
  }

  return rebundle();
});

gulp.task( 'default', ['client'] )
