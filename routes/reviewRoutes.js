const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// GET all reviews for a book
router.get("/book/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reviews by a member
router.get("/member/:memberId", async (req, res) => {
  try {
    const reviews = await Review.find({ memberId: req.params.memberId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all reviews with optional filters
router.get("/", async (req, res) => {
  try {
    const { bookId, memberId, minRating } = req.query;
    let query = {};
    if (bookId) query.bookId = bookId;
    if (memberId) query.memberId = memberId;
    if (minRating) query.rating = { $gte: parseInt(minRating) };
    
    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE review
router.post("/", async (req, res) => {
  try {
    const { bookId, bookTitle, memberId, memberName, rating, review, wouldRecommend } = req.body;
    
    const newReview = new Review({
      bookId,
      bookTitle,
      memberId,
      memberName,
      rating,
      review,
      wouldRecommend,
    });
    
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE review
router.put("/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE review
router.delete("/:id", async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
