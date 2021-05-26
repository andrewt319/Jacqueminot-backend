const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imgSchema = new Schema({
    length: { type: Number, required: false},
    chunkSize: { type: Number, required: false},
    uploadDate: { type: Date, required: false},
    filename: { type: String, required: false},
    md5: { type: String, required: false},
    contentType: { type: String, required: false},
}, {});

const PhotoFiles = mongoose.model('photos', imgSchema);

module.exports = PhotoFiles;  