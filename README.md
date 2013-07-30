connect-include
=============

A node conect middleware component to support shtml-style incldues.

For example, the following in an html file:

```html
<!-- #include file="test.html" -->
```

will be replaced with the contents of test.html.    Note that only the file= directive is supported; virtual= will be ignored.


Installation
------------
To install, do the following

```
npm install --save connect-include
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
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            ssInclude(yeomanConfig.app), // <!--- Add this line here
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            // ...

```


