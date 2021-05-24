const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    password: { type: String, required: true, minlength: 6 },
    first: { type: String, required: true },
    last: { type: String, required: true },
    org: { type: String, required: true },
    major: { type: String, required: true },
    year: { type: Number, required: true },
    occupation: { type: String, required: true },
    clss: { type: String, required: true },
    fam: { type: String, required: true },
    additional: { type: String, required: true },
    fb: { type: String, required: true },
    linkedin: { type: String, required: false },
    beMentor: { type: Boolean, required: false, default: false },
    beMentee: { type: Boolean, required: false, default: false },
    pfp: { type: String, required: false }, 
    pfpName: { type: String, required: false },
    date: { type: Date, required: false },
}, {
    timestamps: true, 
});

const FullUser = mongoose.model('FullUser', userSchema);

module.exports = FullUser;  