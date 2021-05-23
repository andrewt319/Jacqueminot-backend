const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: false },
    bio: { type: String, required: false },
    major: { type: String, required: false },
    year: { type: Number, required: false },
    occupation: { type: String, required: false },
    date: { type: Date, required: false },
    clss: { type: String, required: false },
    fam: { type: String, required: false },
    description: { type: String, required: false },
    fb: { type: String, required: false },
    linkedin: { type: String, required: false },
    mentor: { type: String, required: false },
    mentee: { type: String, required: false },
}, {
    timestamps: true,
});

const FullUser = mongoose.model('FullUser', userSchema);

module.exports = FullUser;