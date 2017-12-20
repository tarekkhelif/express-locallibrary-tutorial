// Use vanilla js Promises instead of the async module, which is used in the tutorial
const evaluate_promises_wrapped_in_object = require('../helpers/help-async').evaluate_promises_wrapped_in_object;

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

exports.index = async function(request, response) {
    evaluate_promises_wrapped_in_object({
        book_count: Book.count().exec(),
        book_instance_count: BookInstance.count().exec(),
        book_instance_available_count: BookInstance.count({status: 'Available'}).exec(),
        author_count: Author.count().exec(),
        genre_count: Genre.count().exec()
    })
    .then(results => {
        response.render('index', {title: 'Local Library Home', data: results}
    )})
    .catch(error => {   
        response.render('index', {title: 'Local Library Home', error: error}
)});


    /*
    async.parallel({
        book_count: function(callback) {
            Book.count(callback);
        },
        book_instance_count: function(callback) {
            BookInstance.count(callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count(callback);
        },
        genre_count: function(callback) {
            Genre.count(callback);
        },
    }, function(error, results) {
        response.render('index', { title: 'Local Library Home', error: error, data: results });
    });
    */
};