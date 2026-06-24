const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, sparse: true },
  genre: { type: String, default: "General" },
  publishYear: { type: Number, default: null },
  description: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ["available", "issued", "reserved", "damaged", "lost"],
    default: "available",
  },
  issuedTo: { type: String, default: null },
  issuedDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
