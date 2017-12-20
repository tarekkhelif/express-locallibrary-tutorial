const BookInstance = require('../models/bookinstance');
const Book = require('../models/book')
const evaluate_promises_wrapped_in_object = require('../helpers/help-async').evaluate_promises_wrapped_in_object;

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {
      BookInstance.find()
        .populate('book')
        .exec()
        .then( bookinstance_list => res.render('bookinstance_list', 
                   { title: 'Book Instance List', 
                     bookinstance_list: bookinstance_list
                    }))
         .catch(err => next(err));
    };

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id).populate('book').exec()
        .then(bookinstance => res.render('bookinstance_detail', {
                        title: 'Book Copy:',
                        bookinstance: bookinstance
        }))
        .catch(err => nect(err));
    };

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({},'title').exec()
        .then(book_list => res.render('bookinstance_form', {
            title: 'Create A Copy', 
            book_list: book_list
        }))
        .catch(err => next(err));
    };

// Handle BookInstance create on POST 
exports.bookinstance_create_post = function(req, res, next) {
    
        req.checkBody('book', 'Book must be specified').notEmpty(); // We won't force Alphanumeric, because book titles might have spaces.
        req.checkBody('imprint', 'Imprint must be specified').notEmpty();
        req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
        
        req.sanitize('book').escape();
        req.sanitize('imprint').escape();
        req.sanitize('status').escape();
        req.sanitize('book').trim();
        req.sanitize('imprint').trim();   
        req.sanitize('status').trim();
        
        //Run the validators because below code will modify the value of due_back which will cause validation error
        var errors = req.validationErrors();
        req.sanitize('due_back').toDate();
        
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint, 
            status: req.body.status,
            due_back: req.body.due_back
        });
        
        if (errors) {
            Book.find({},'title').exec()
            .then(book_list => res.render('bookinstance_form', { 
                title: 'Create BookInstance', 
                book_list: book_list, 
                selected_book_id: bookinstance.book._id, 
                errors: errors, 
                bookinstance: bookinstance 
            }))
            .catch(err => next(err));
            return;
        }
        else { // Data from form is valid
            bookinstance.save()
            .then(bookinstance => res.redirect(bookinstance.url))
            .catch(err => next(err));
        }
    };

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {
        BookInstance.findById(req.params.id).exec()
        .then(bookinstance => {
            res.render('bookinstance_delete', {
                title: "Delete This Copy",
                bookinstance: bookinstance
            })
        })
        .catch(err => next(err));
    };

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, next) {
        req.checkBody('bookinstanceid', 'Book instance must exist').notEmpty();

        BookInstance.findByIdAndRemove(req.params.id).exec()
        .then(results => res.redirect('/catalog/bookinstances'))
        .catch(err => next(err));
    };

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {
        evaluate_promises_wrapped_in_object({
            bookinstance: BookInstance.findById(req.params.id)
            .populate('book').exec(),
            book_list: Book.find({}, 'title').exec()
        })
        .then(results => res.render('bookinstance_form', {
            title: "Update This Copy",
            book_list: results.book_list,
            selected_book_id: results.bookinstance.book._id,
            bookinstance: results.bookinstance
            }))
        .catch(err => next(err));
    };

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res) {
    
        req.checkBody('book', 'Book must be specified').notEmpty(); // We won't force Alphanumeric, because book titles might have spaces.
        req.checkBody('imprint', 'Imprint must be specified').notEmpty();
        req.checkBody('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
        
        req.sanitize('book').escape();
        req.sanitize('imprint').escape();
        req.sanitize('status').escape();
        req.sanitize('book').trim();
        req.sanitize('imprint').trim();   
        req.sanitize('status').trim();
        
        // Run the validators because below code will modify the value of due_back which will cause validation error
        var errors = req.validationErrors();
        req.sanitize('due_back').toDate();
        
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint, 
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
        });
        
        // Data from form is invalid.  Re-render book with error information.
        if (errors) {
            Book.find({},'title').exec()
            .then(book_list => res.render('bookinstance_form', { 
                title: 'Create BookInstance', 
                book_list: book_list, 
                selected_book_id: bookinstance.book._id, 
                errors: errors, 
                bookinstance: bookinstance 
            }))
            .catch(err => next(err));
            return;
        }
        // Data from form is valid. Update the record.
        else {
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}).exec()
            .then(bookinstance => res.redirect(bookinstance.url))
            .catch(err => next(err));
        }
    };