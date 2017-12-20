const Author = require('../models/author');
const Book = require('../models/book');
const evaluate_promises_wrapped_in_object = require('../helpers/help-async').evaluate_promises_wrapped_in_object;

// Display list of all Authors
exports.author_list = function(req, res, next) {
      Author.find()
        .sort([['family_name', 'ascending']])
        .exec()
        .then(author_list => res.render('author_list', 
                                        { title: 'Author List', 
                                          author_list: author_list 
                                        }))
        .catch(err => next(err));
    };

// Display detail page for a specific Author
exports.author_detail = function(req, res, next) {
    evaluate_promises_wrapped_in_object({
        author: Author.findById(req.params.id).exec(),
        author_books: Book.find({author: req.params.id})
        .populate('genre').exec()
    })
        .then(results => res.render('author_detail', {
                                    title: 'Author Detail',
                                    author: results.author,
                                    author_books: results.author_books
                                }))
        .catch(err => next(err));
    };
// Display Author create form on GET
exports.author_create_get = function(req, res, next) {       
            res.render('author_form', { title: 'Create Author'});
        };

// Handle Author create on POST 
exports.author_create_post = function(req, res, next) {
    
     req.checkBody('first_name', 'First name must be specified.').notEmpty(); //We won't force Alphanumeric, because people might have spaces.
     req.checkBody('family_name', 'Family name must be specified.').notEmpty();
     req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlphanumeric();
     req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isISO8601(); 
     req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isISO8601();    
      
     req.sanitize('first_name').escape();
     req.sanitize('family_name').escape();
     req.sanitize('first_name').trim();     
     req.sanitize('family_name').trim();
 
     // check for errors here because below code will modify the value of dates which may cause validation error.
     var errors = req.validationErrors();
     req.sanitize('date_of_birth').toDate();
     req.sanitize('date_of_death').toDate();
 
     
     var author = new Author(
       { first_name: req.body.first_name, 
         family_name: req.body.family_name, 
         date_of_birth: req.body.date_of_birth,
         date_of_death: req.body.date_of_death
        });
        
     if (errors) {
        res.render('author_form', { title: 'Create Author', 
                                    author: author, 
                                    errors: errors
                                });
        return;
     } 
     else { // Data from form is valid
         author.save()
         .then(author => res.redirect(author.url))
         .catch(err => next(err));
     }
 };

// Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {
        evaluate_promises_wrapped_in_object({
            author: Author.findById(req.params.id).exec(),
            authors_books: Book.find({ 'author': req.params.id }).exec(),
        })
        .then(results => res.render('author_delete', { 
            title: 'Delete Author', 
            author: results.author, 
            author_books: results.authors_books 
        }))
        .catch(err => next(err));
    };

// Handle Author delete on POST 
exports.author_delete_post = function(req, res, next) {
        req.checkBody('authorid', 'Author id must exist').notEmpty();  
        
        evaluate_promises_wrapped_in_object({
            author: Author.findById(req.params.id).exec(),
            authors_books: Book.find({ 'author': req.params.id }).exec(),
        })
        .then(results => {
            //Author has books. Render in same way as for GET route.
            if (results.authors_books.length > 0) {
                res.render('author_delete', { 
                    title: 'Delete Author', 
                    author: results.author, 
                    author_books: results.authors_books 
                });
                return;
            }
            //Author has no books. Delete object and redirect to the list of authors.
            else {
                Author.findByIdAndRemove(req.body.authorid).exec()
                .then(result => res.redirect('/catalog/authors'))
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
    };

// Display Author update form on GET
exports.author_update_get = function(req, res, next) {
    Author.findById(req.params.id).exec()
        .then(author => {
            res.render('author_form', {
                title: 'Update Author',
                author: author
            })
        })
        .catch(err => next(err));
    };

// Handle Author update on POST
exports.author_update_post = function(req, res, next) {
    
    // Validate fields
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.')
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.')
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601()
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601()

    // Sanitize fields
    sanitizeBody('first_name').trim().escape()
    sanitizeBody('family_name').trim().escape()
    sanitizeBody('date_of_birth').toDate()
    sanitizeBody('date_of_death').toDate()
 
    // Extract the validation errors from a request 
    const errors = validationResult(req);

    //Create Author object with escaped and trimmed data (and the old id!)
    var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id
        });
    
    // There are errors. Render the form again with sanitized values and error messages.
    if (!errors.isEmpty()) {
        res.render('author_form', { title: 'Update Author', author: author, errors: errors.array()});
        return;
    }
    // Data from form is valid. Update the record.
    else {
        Author.findByIdAndUpdate(req.params.id, author, {}).exec()
            .then(author => res.redirect(theauthor.url))
            .catch(err => next(err));
    }
    };