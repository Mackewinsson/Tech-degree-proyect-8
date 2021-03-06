const express = require("express");
const router = express.Router();
const { Book } = require("../models");

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// get /books - Shows the full list of books. OK
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render("index", {
      title: "Books",
      books,
    });
  })
);

// get /books/new - Shows the create new book form. OK
router.get(
  "/new",
  asyncHandler(async (req, res) => {
    res.render("new-book", { title: "New Book" });
  })
);

// post /books/new - Posts a new book to the database.
router.post(
  "/",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await req.body;
      const newBook = await Book.create(book);
      res.redirect(`/books/${newBook.id}`);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        res.render("new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        const err = new Error();
        err.status = 500;
        throw err;
      }
    }
  })
);

// get /books/:id - Shows book detail form. OK
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { title: book.title, book });
    } else {
      const err = new Error();
      err.status = 500;
      throw err;
    }
  })
);

// post /books/:id - Updates book info in the database.
router.post(
  "/:id/edit",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect(`/books/${book.id}`);
      } else {
        res.render("error");
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: error.errors,
          title: "Edit Book",
        });
      } else {
        const err = new Error();
        err.status = 500;
        throw err;
      }
    }
  })
);
// post /books/:id/delete - Deletes a book. Careful, this can’t be undone. It can be helpful to create a new “test” book to test deleting.
router.post(
  "/:id/delete",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy(req.body);
      res.redirect(`/books`);
    } else {
      const err = new Error();
      err.status = 500;
      throw err;
    }
  })
);

module.exports = router;
