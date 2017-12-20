const Genre = require('../models/genre');
const Book = require('../models/book');
const evaluate_promises_wrapped_in_object = require('../helpers/help-async').evaluate_promises_wrapped_in_object;

// Display list of all Genre
exports.genre_list = function(req, res, next) {
    Genre.find().sort([['name', 'ascending']]).exec()
         .then(genre_list => res.render('genre_list', {
                                         title: 'Genre List', 
                                         genre_list: genre_list
                                     }))
        .catch(err => next(error));
    };

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {
    evaluate_promises_wrapped_in_object({
        genre: Genre.findById(req.params.id).exec(),
        genre_books: Book.find({genre: req.params.id}).exec()})
        .then(results => res.render('genre_detail', {
                                   title: 'Genre Detail',
                                   genre: results.genre,
                                   genre_books: results.genre_books
                              }))
        .catch(err => next(err));
    };

// Display Genre create form on GET
exports.genre_create_get = function(req, res) {
        res.render('genre_form', {title: 'Create New Genre'});
    };

// Handle Genre create on POST 
exports.genre_create_post = function(req, res, next) {
    // Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty(); 
    
    // Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    // Run the validators
    var errors = req.validationErrors();

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name });
    
    if (errors) {
        // If there are errors render the form again, passing the previously entered values and errors
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors});
        return;
        } 
    else { // Data from form is valid.
        // Check if Genre with same name already exists
        Genre.findOne({ 'name': req.body.name }).exec()
            .then(found_genre => {
                 console.log('found_genre: ' + found_genre);
                 // Genre exists, redirect to its detail page
                 if (found_genre) res.redirect(found_genre.url);
                 else {
                     genre.save()
                     .then(doc => res.redirect(genre.url))
                     .catch(err => next(err))
                    }
            })
            .catch(err => next(err));
        }
    };

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {
        evaluate_promises_wrapped_in_object({
            genre: Genre.findById(req.params.id).exec(),
            genre_books: Book.find({genre: req.params.id}).exec()
        })
        .then(results => {
            res.render('genre_delete', {
                title: "Delete Genre",
                genre: results.genre,
                genre_books: results.genre_books
            })
        })
        .catch(err => next(err));
    };

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {
        req.checkBody('genreid', 'Genre must exist').notEmpty();

        Genre.findByIdAndRemove(req.params.id).exec()
        .then(results => res.redirect('catalog/genres'))
        .catch(err => next(err));
    };

// Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {
        Genre.findById(req.params.id).exec()
        .then(genre => res.render('genre_form', {
            title: "Update Genre",
            genre: genre
        }))
        .catch(err => next(err));
    };

// Handle Genre update on POST
exports.genre_update_post = function(req, res) {
    // Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty(); 
    
    // Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    // Run the validators
    var errors = req.validationErrors();

    // Create a genre object with escaped and trimmed data.
    var genre = new Genre({ name: req.body.name, _id: req.params.id });
    
    if (errors) {
        // If there are errors render the form again, passing the previously entered values and errors
        res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors});
        return;
        } 
    else { // Data from form is valid.
        // Check if Genre with same name already exists
        Genre.findOne({ 'name': req.body.name }).exec()
            .then(found_genre => {
                 // Genre exists, redirect to its detail page
                 if (found_genre) res.redirect(found_genre.url);
                 else {
                     Genre.findByIdAndUpdate(req.params.id, genre, {}).exec()
                     .then(doc => res.redirect(genre.url))
                     .catch(err => next(err))
                    }
            })
            .catch(err => next(err));
        }
    };