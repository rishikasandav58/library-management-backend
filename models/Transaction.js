const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  bookTitle: { type: String, required: true },
  bookIsbn: { type: String },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", default: null },
  memberName: { type: String, required: true },
  memberEmail: { type: String },
  action: { type: String, enum: ["issue", "return"], required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  returnDate: { type: Date },
  status: { type: String, enum: ["active", "returned", "overdue"], default: "active" },
  notes: { type: String, default: "" },
  fineAmount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);