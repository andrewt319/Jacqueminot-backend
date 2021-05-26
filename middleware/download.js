var Grid = require('gridfs-stream');
var mongoose = require("mongoose");
Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);

app.post('/picture', function(req, res) {
 var part = req.files.filefield;

            var writeStream = gfs.createWriteStream({
                filename: part.name,
                mode: 'w',
                content_type:part.mimetype
            });


            writeStream.on('close', function() {
                 return res.status(200).send({
                    message: 'Success'
                });
            });

            writeStream.write(part.name);

            writeStream.end();
   });