const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  bookTitle: { type: String, required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  memberName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true },
  wouldRecommend: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
