const mongoose = require('mongoose');

const Schema = mongoose.Schema;

GenreSchema = new Schema({
    name: {type: String, required: true, min: 3, max: 100},
})

// Virtual attribute for genre's URL
GenreSchema
    .virtual('url')
    .get(function () {
        return '/catalog/genre/' + this._id;
    });

// Export model
module.exports = mongoose.model('Genre', GenreSchema);