module.exports = function shtmlEmulator(rootDir) {

    return function(req, res, next) {
        var Buffer = require('buffer').Buffer;
        var WritableStream = require("stream-buffers").WritableStreamBuffer;
        var fs = require('fs');
        var path = require('path');
        var _ = require('underscore');

        if(req.url != "/" && !req.url.match(/\.s?html$/))
            return next();

        var buffer = new WritableStream();

        var oldWrite = res.write;
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
            var includes = body.match(/<!--\s?#include file=\".+\" -->/g);
            if (!includes) {
                return oldEnd.call(this, body);
            }


            var remaining = includes.length;

            _.each(includes, function(include) {
                var file = path.join(rootDir, path.dirname(req.url), include.match(/<!--\s?#include file=\"(.+)\" -->/)[1]);

                fs.readFile(file, 'utf8', function(err, data) {
                    if(err) {
                        console.log("ERROR including file " + file + ": " + err);
                    }
                    else {
                        body = body.replace(include, data);
                    }

                    if (!--remaining) {
                        oldEnd.call(this, body);
                    }
                });
            });
        }

        next();
    }
}
