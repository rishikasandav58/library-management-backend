const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");

// GET all transactions with optional filters
router.get("/", async (req, res) => {
  try {
    const { memberId, bookId, status, action, search } = req.query;
    let query = {};
    
    if (memberId) query.memberId = memberId;
    if (bookId) query.bookId = bookId;
    if (status) query.status = status;
    if (action) query.action = action;
    if (search) {
      query.$or = [
        { bookTitle: { $regex: search, $options: "i" } },
        { memberName: { $regex: search, $options: "i" } },
      ];
    }
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET overdue transactions
router.get("/overdue", async (req, res) => {
  try {
    const now = new Date();
    const overdue = await Transaction.find({
      status: "active",
      dueDate: { $lt: now },
    }).sort({ dueDate: 1 });
    res.json(overdue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET transaction stats
router.get("/stats/overview", async (req, res) => {
  try {
    const total = await Transaction.countDocuments();
    const active = await Transaction.countDocuments({ status: "active" });
    const overdue = await Transaction.countDocuments({
      status: "active",
      dueDate: { $lt: new Date() },
    });
    const returned = await Transaction.countDocuments({ status: "returned" });
    
    // Monthly stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentIssues = await Transaction.countDocuments({
      action: "issue",
      createdAt: { $gte: thirtyDaysAgo },
    });
    const recentReturns = await Transaction.countDocuments({
      action: "return",
      createdAt: { $gte: thirtyDaysAgo },
    });
    
    res.json({
      total,
      active,
      overdue,
      returned,
      recentIssues,
      recentReturns,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET member's transactions
router.get("/member/:memberId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      memberId: req.params.memberId,
    }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET book's transactions
router.get("/book/:bookId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      bookId: req.params.bookId,
    }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE transaction (issue book)
router.post("/", async (req, res) => {
  try {
    const { bookId, bookTitle, bookIsbn, memberId, memberName, memberEmail, dueDate, notes } = req.body;
    
    const transaction = new Transaction({
      bookId,
      bookTitle,
      bookIsbn,
      memberId,
      memberName,
      memberEmail,
      action: "issue",
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
      status: "active",
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RETURN book
router.put("/return/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        action: "return",
        returnDate: new Date(),
        status: "returned",
      },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE transaction (for fines, notes, etc.)
router.put("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
