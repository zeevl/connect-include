connect-include
=============

A node conect middleware component to support shtml-style includes.

For example, the following in an html file:

```html
<!-- #include file="test.html" -->
```

will be replaced with the contents of test.html. Note that only the file= directive is supported; virtual= will be ignored.


Installation
------------
To install, do the following

```
npm install connect-include --save
```

Then include as a middleware component to connect:

```javascript
var include = require('connect-include');

connect().use(include('/my/web/root'));
```

Gruntfile.js
------------
If you're using Grunt, include as follows in `Gruntfile.js`:

```javascript

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // include connect-include
    var ssInclude = require("connect-include");

    grunt.initConfig({
        // ...
        connect: {
            // ...
            livereload: {
                options: {
                    middleware: function(connect, options) {
                        // Same as in grunt-contrib-connect
                        var middlewares = [];
                        var directory = options.directory || options.base[options.base.length - 1];
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        // Here we insert connect-include, use the same pattern to add other middleware
                        middlewares.push(ssInclude(directory));

                        // Same as in grunt-contrib-connect
                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });

                        middlewares.push(connect.directory(directory));
                            return middlewares;
                    }
                }
            },
            // ...

```

