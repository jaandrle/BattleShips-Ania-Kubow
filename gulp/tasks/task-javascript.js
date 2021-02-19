/* jshint esversion: 6,-W097, -W040, node: true, expr: true */
/*jsondoc={
    "version": "0.1.5",
    "script_name": "gulp_task_javascript_lib",
    "description": "Gulp task for processing `*.js` in `app.directories.src`. It also validate non `*.min.js` output files (in `app.directories.bin`). More description __TBD__.",
    "root_path": "gulp_tasks"
}*/
module.exports= function({gulp, scripts, $g, $o, app, cordova_target_device, error}){
    const /* files source and destination */
        [ folder, files_pattern, files_not_pattern ]= [ app.directories.src, "*.js", "*.sub.js" ],
        destination= app.directories.bin;
    const [jshint_cmd, ...jshint_rest]= scripts.jshint.split(" ");
    /* jshint -W061 */const gulp_place= $g.place({ variable_eval: (str)=> eval(str), filesCleaner: require("../gulp_cleanJSHINT.js") });/* jshint +W061 */
    return function(cb){
        let out_files= [];
        if(error.getNum()) return cb();
        jsHint(folder)
        .then(run)
        .then(()=> Promise.all(out_files.map(file=> destination+file).map(jsHint))).then(skipPromise)
        .catch(identityPromise)
        .then(cb);
    
        function run(){
            return new Promise(function(resolve){
                gulp.src([ `${folder}**/${files_pattern}`, `!${folder}**/${files_not_pattern}` ])
                    .pipe(gulp_place({ folder, string_wrapper: '"' }))
                    //.pipe($g.replace(/\/\/gulp\.remove\.line\r?\n/g, ""))
                    //.pipe($g.replace(/[^\n]*(\/\*\s*gulp\s\*\/)?\/\*\s*global gulp_place\s*\*\/\r?\n/g,""))
                    //.pipe($g.minify_js({ ext: { min: ".min.js" }, noSource: false, mangle: true, compress: { conditionals: true, evaluate: true } }))
                    .on('error', error.handler)
                    .on('data', function({ basename }= {}){ if(!/.*\.min.js$/.test(basename)) out_files.push(basename); })
                    .pipe(gulp.dest(destination))
                    .on('end', resolve);
            });
        }
        function jsHint(files_for_lint){
            return new Promise(function(resolve, reject){
                let cmd= $o.spawn(jshint_cmd, [...jshint_rest, files_for_lint], {});
                cmd.stdout.on('data', error.logBuffer);
                cmd.on('close', code=> code ? error.logSave("javascripts", reject) : resolve());
            });
        }
    };
    function skipPromise(){ }
    function identityPromise(params){ return params; }
};