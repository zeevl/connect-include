'use strict';

module.exports = function shtmlEmulator(rootDir) {

    return function(req, res, next) {
        var WritableStream = require('stream-buffers').WritableStreamBuffer;
        var fs = require('fs');
        var path = require('path');
        var _ = require('underscore');

        if(req.url !== '/' && !req.url.match(/\.s?html(?:#|\?)?/)) {
            return next();
        }

        var buffer = new WritableStream();

        res.write = function(chunk) {
            buffer.write(chunk);
            return true;
        };

        var oldEnd = res.end;
        res.end = function(data) {
            if(data) {
                buffer.write(data);
            }

            if (!buffer.size()) {
                return oldEnd.call(this, buffer.getContents());
            }

            var body = buffer.getContentsAsString();
            var includes = body.match(/<!--\s?#include (?:virtual|file)=\"(.+)\"\s?-->/g);
            if (!includes) {
                return oldEnd.call(this, body);
            }


            var remaining = includes.length;

            _.each(includes, function(include) {
                var pathDirName = path.dirname(req.url);

                if(include.match(/<!--\s?#include (?:virtual|file)=\"(.+)\"\s?-->/)[1] === 'virtual'){
                    pathDirName = '';
                }

                var file = path.join(rootDir, pathDirName, include.match(/<!--\s?#include (?:virtual|file)=\"(.+)\"\s?-->/)[1]);

                fs.readFile(file, 'utf8', function(err, readData) {
                    if(err) {
                        console.log('ERROR including file ' + file + ': ' + err);
                    }
                    else {
                        body = body.replace(include, readData);
                    }

                    if (!--remaining) {
                        oldEnd.call(this, body);
                    }
                });
            });
        };

        next();
    };
};
