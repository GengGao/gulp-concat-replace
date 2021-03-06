'use strict';

var common = require('./common');
var objectAssign = require('object-assign');
var Parser = require('./parser');
var Transform = require('readable-stream/transform');

module.exports = function (userConfig) {
	var options = {};
    var tasks = common.parseTasks(options);

    var config = {};

    objectAssign(config, userConfig);
    
    return new Transform({
        objectMode: true,
        transform: function (file, enc, callback) {
            var parser = new Parser(tasks, config, file);

            if (file.isBuffer()) {
                parser.write(file.contents);
                parser.end();

                var contents = new Buffer(0);
                parser.on('data', function (data) {
                    contents = Buffer.concat([contents, data]);
                });
                parser.once('end', function () {
                    file.contents = contents;
                    callback(null, file);
                });
                return;
            }

            if (file.isStream()) {
                file.contents = file.contents.pipe(parser);
            }

            callback(null, file);
        }
    });
};
