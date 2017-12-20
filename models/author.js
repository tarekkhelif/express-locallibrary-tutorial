const mongoose = require('mongoose');
const formatDate = require('../helpers/help-formatting').formatDate;

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}
    }
);

// Virtual attribute for author's full name
AuthorSchema
    .virtual('name')
    .get(function() { return `${this.family_name}, ${this.first_name}`; });

// Virtual attribute for author's URL
AuthorSchema
    .virtual('url')
    .get(function () { return '/catalog/author/' + this._id; });

// Virtual attribute for author's DOB
AuthorSchema
    .virtual('dob_formatted')
    .get(function () { return formatDate(this.date_of_birth); });
    
// Virtual attribute for author's DOD
AuthorSchema
    .virtual('dod_formatted')
    .get(function () { return formatDate(this.date_of_death); });

// Virtual attribute for author's lifespan
AuthorSchema
    .virtual('lifespan')
    .get(function () { return `(${this.dob_formatted} - ${this.dod_formatted})`; });

// Additional date format virtual useful for rendering dates in HTML forms
AuthorSchema
    .virtual('date_of_birth_yyyy_mm_dd')
    .get(function () { return formatDate(this.date_of_birth, 'YYYY-MM-DD'); });

// Additional date format virtual useful for rendering dates in HTML forms
AuthorSchema
    .virtual('date_of_death_yyyy_mm_dd')
    .get(function () { return formatDate(this.date_of_death, 'YYYY-MM-DD'); });

//Export model
module.exports = mongoose.model('Author', AuthorSchema);