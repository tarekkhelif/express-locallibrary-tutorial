const mongoose = require('mongoose');
const formatDate = require('../helpers/help-formatting').formatDate;

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
    book: {type: Schema.ObjectId, ref: 'Book', required: true},
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 
        'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now()}
});

// Virtual attribute for bookinstance's URL
BookInstanceSchema
    .virtual('url')
    .get(function () {
        return '/catalog/bookinstance/' + this._id;
    });

// Virtual attribute for bookinstance's due date
BookInstanceSchema
    .virtual('due_back_formatted')
    .get(function () {return formatDate(this.due_back)});

// Additional date format virtual useful for rendering dates in HTML forms
BookInstanceSchema
.virtual('due_back_yyyy_mm_dd')
.get(function () { return formatDate(this.due_back, 'YYYY-MM-DD'); });

// Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);