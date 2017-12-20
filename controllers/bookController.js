const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const Author = require('../models/author');
const Genre = require('../models/genre');
const evaluate_promises_wrapped_in_object = require('../helpers/help-async').evaluate_promises_wrapped_in_object;
const inArray = require('../helpers/help-iteration').inArray;

// Display list of all books
exports.book_list = function(req, res, next) {
      Book.find({}, 'title author')
        .populate('author')
        .exec()
        .then(book_list => 
            res.render('book_list', { title: 'Book List', book_list: book_list }))
        .catch(err => next(err));
    };

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {
    evaluate_promises_wrapped_in_object({
        book: Book.findById(req.params.id)
        .populate('author').populate('genre').exec(),
        book_instances: BookInstance.find({book: req.params.id})
        .populate('book').exec()
    })
        .then(results => res.render('book_detail', {
                                    title: 'Book Detail', 
                                    book: results.book,
                                    book_instances: results.book_instances
                                    }))
        .catch(err => next(err));
    };

// Display book create form on GET
exports.book_create_get = function(req, res, err) {
    evaluate_promises_wrapped_in_object({
        authors: Author.find().exec(),
        genres: Genre.find().exec()
    })
        .then(results => res.render('book_form', { 
                title: 'Create Book', 
                authors: results.authors, 
                genres: results.genres 
            }))
        .catch(err => next(err))
    };

// Handle book create on POST 
exports.book_create_post = function(req, res, next) {
    
        req.checkBody('title', 'Title must not be empty.').notEmpty();
        req.checkBody('author', 'Author must not be empty').notEmpty();
        req.checkBody('summary', 'Summary must not be empty').notEmpty();
        req.checkBody('isbn', 'ISBN must not be empty').notEmpty();
    
        req.sanitize('title').escape();
        req.sanitize('author').escape();
        req.sanitize('summary').escape();
        req.sanitize('isbn').escape();
        req.sanitize('title').trim();
        req.sanitize('author').trim();
        req.sanitize('summary').trim();
        req.sanitize('isbn').trim();
         // Sanitize genre array for each value individually as validator works for string value only
         if(req.body.genre instanceof Array){
            req.body.genre = req.body.genre.map(initialGenre => {
                req.body.tempGenre = initialGenre;
                req.sanitize('tempGenre').escape();
                return req.body.tempGenre;
            });
            delete req.body.tempGenre;
            } else
            req.sanitize('genre').escape();
    
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre
           });
    
        console.log('BOOK:', book);
    
        var errors = req.validationErrors();
        if (errors) {
            // Some problems so we need to re-render our book
            console.log('GENRE:', req.body.genre);
    
            console.log('ERRORS:', errors);

            //Get all authors and genres for form
            evaluate_promises_wrapped_in_object({
                    authors: Author.find().exec(),
                    genres: Genre.find().exec()
            })
            .then(results => {
                for (const genre of results.genres) {
                    genre.checked = inArray(genre._id, book.genre);
                }

                res.render('book_form', { title: 'Create Book',
                                          authors:results.authors, 
                                          genres:results.genres, 
                                          book: book, 
                                          errors: errors });
            })
            .catch(err => next(err));
        }
        else {  // Data from form is valid.
            // We could check if book exists already, but lets just save.
            book.save()
            .then(book => res.redirect(book.url)) // Successful - redirect to new book record.
            .catch(err => next(err));
        }
    };

// Display book delete form on GET
exports.book_delete_get = function(req, res, next) {
    evaluate_promises_wrapped_in_object({
        book: Book.findById(req.params.id)
            .populate('author').populate('genre').exec(),
        book_instances: BookInstance.find({book: req.params.id}).exec()
    })
    .then(results => {
        res.render('book_delete', {
            title: 'Delete Book',
            book: results.book,
            book_instances: results.book_instances
        })
    })
    .catch(err => next(err));
    };

// Handle book delete on POST
exports.book_delete_post = function(req, res, next) {
    req.checkBody('bookid', 'Book must exist').notEmpty();
    
    evaluate_promises_wrapped_in_object({
        book: Book.findById(req.params.id).exec(),
        book_bookinstances: BookInstance.find({ 'book': req.params.id }).exec(),
    })
    .then(results => {
        // Book has bookinstances. Render in same way as for GET route.
        if (results.book_bookinstances.length > 0) {
            res.render('book_delete', { 
                title: 'Delete Book', 
                book: results.book, 
                book_bookinstances: results.book_bookinstances 
            });
            return;
        }
        // Book has no bookinstances. Delete book and redirect to the list of books.
        else {
            Book.findByIdAndRemove(req.body.bookid).exec()
            .then(result => res.redirect('/catalog/books'))
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
    };

// Display book update form on GET
exports.book_update_get = function(req, res, next) {
        req.sanitize('id').escape();
        req.sanitize('id').trim();
    
        //Get book, authors and genres for form
        evaluate_promises_wrapped_in_object({
            book: Book.findById(req.params.id).exec(),
            authors: Author.find().exec(),
            genres: Genre.find().exec()
        })
        .then(results => {
            // Mark our selected genres as checked
            for (const genre of results.genres) {
                genre.checked = inArray(genre._id, results.book.genre);
            }

            res.render('book_form', { 
                title: 'Update Book', 
                authors: results.authors, 
                genres: results.genres, 
                book: results.book 
            });
        })
        .catch(err => next(err));
        
    };

// Handle book update on POST 
exports.book_update_post = function(req, res, next) {
        //Sanitize id passed in.
        req.sanitize('id').escape();
        req.sanitize('id').trim();
    
        //Check other data
        req.checkBody('title', 'Title must not be empty.').notEmpty();
        req.checkBody('author', 'Author must not be empty').notEmpty();
        req.checkBody('summary', 'Summary must not be empty').notEmpty();
        req.checkBody('isbn', 'ISBN must not be empty').notEmpty();
    
        req.sanitize('title').escape();
        req.sanitize('author').escape();
        req.sanitize('summary').escape();
        req.sanitize('isbn').escape();

        req.sanitize('title').trim();
        req.sanitize('author').trim();
        req.sanitize('summary').trim();
        req.sanitize('isbn').trim();
    
        // Sanitize genre array for each value individually as validator works for string values only
        if (req.body.genre instanceof Array){
            req.body.genre = req.body.genre.map(initialGenre => {
                req.body.tempGenre = initialGenre;
                req.sanitize('tempGenre').escape();
                return req.body.tempGenre;
            });
            delete req.body.tempGenre;
        }
        else req.sanitize('genre').escape();
        
    
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });
    
        var errors = req.validationErrors();
        // Data from form is invalid.  Re-render book with error information.
        if (errors) {
            // Get all authors and genres for form
            evaluate_promises_wrapped_in_object({
                authors: Author.find().exec(),
                genres: Genre.find().exec(),
            })
            .then(results => {
                // Mark our selected genres as checked
                for (const genre of results.genres) {
                    genre.checked = inArray(genre._id, book.genre);
                }

                res.render('book_form', { 
                    title: 'Update Book',
                    authors: results.authors, 
                    genres: results.genres, 
                    book: book, 
                    errors: errors 
                });
            })
            .catch(err => next(err));
    
        }
        // Data from form is valid. Update the record.
        else {
            Book.findByIdAndUpdate(req.params.id, book, {}).exec()
            .then(book => res.redirect(book.url))
            .catch(err => next(err));
        }
    };