const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");
// GET all books with optional search/filter
router.get("/", async (req, res) => {
  try {
    const { search, genre, status, sortBy, order } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }
    if (genre && genre !== "All") query.genre = genre;
    if (status && status !== "All") query.status = status;
    
    let sort = {};
    if (sortBy) {
      sort[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sort = { addedAt: -1 };
    }
    
    const books = await Book.find(query).sort(sort);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET stats
router.get("/stats/overview", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ status: "available" });
    const issuedBooks = await Book.countDocuments({ status: "issued" });
    let totalMembers = 0;
    try {
      const Member = require("../models/Member");
      totalMembers = await Member.countDocuments();
    } catch (e) {
      totalMembers = 0;
    }
    
    const genreStats = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    const recentBooks = await Book.find().sort({ addedAt: -1 }).limit(5);
    
    res.json({
      totalBooks,
      availableBooks,
      issuedBooks,
      totalMembers,
      genreStats,
      recentBooks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD
router.post("/", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ISSUE BOOK
router.put("/issue/:id", async (req, res) => {
  try {
    const { issuedTo, dueDate, memberId, memberEmail, notes } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        status: "issued",
        issuedTo,
        issuedDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      { new: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      bookId: book._id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      memberId: memberId || null,
      memberName: issuedTo,
      memberEmail: memberEmail || "",
      action: "issue",
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "active",
      notes: notes || "",
    });
    await transaction.save();

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RETURN BOOK
router.put("/return/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Update the book
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        status: "available",
        issuedTo: null,
        issuedDate: null,
        dueDate: null,
      },
      { new: true }
    );

    // Update the most recent active transaction for this book
    await Transaction.findOneAndUpdate(
      { bookId: req.params.id, status: "active" },
      { status: "returned", action: "return", returnDate: new Date() },
      { sort: { createdAt: -1 } }
    );

    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
