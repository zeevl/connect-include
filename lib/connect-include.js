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
			var context = this;
		
            if(data) {
                buffer.write(data);
            }

            if (!buffer.size()) {
                return oldEnd.call(context, buffer.getContents());
            }

            var body = buffer.getContentsAsString();
            var includes = body.match(/<!--\s?#include (virtual|file)=\".+\" -->/g);
            if (!includes) {
                return oldEnd.call(context, body);
            }

			var remaining = includes.length;
			
            _.each(includes, function(include) {
			
				var pathDirName = path.dirname(req.url);

				if(include.match(/<!--\s?#include (virtual|file)=\"(.+)\" -->/)[1] === 'virtual'){
					pathDirName = '';
				}
				
                var file = path.join(rootDir, pathDirName, include.match(/<!--\s?#include (virtual|file)=\"(.+)\" -->/)[2]);

                fs.readFile(file, 'utf8', function(err, data) {
                    if(err) {
                        console.log("ERROR including file " + file + ": " + err);
                    }
                    else {
                        body = body.replace(include, data);
                    }
					
                    if (!--remaining) {
                        oldEnd.call(context, body);
                    }
                });
            });

        }

        next();
    }
}
