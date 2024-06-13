const mongoose = require('mongoose');
const { required } = require('../../Frontend/src/util/validators');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    creator: {
        type: Object,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema);