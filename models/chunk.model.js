const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chunkSchema = new Schema({}, {});

const Chunks = mongoose.model('photos.chunks', chunkSchema);

module.exports = Chunks;  