const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  membershipStatus: {
    type: String,
    enum: ["active", "inactive", "suspended", "expired"],
    default: "active",
  },
  joinDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
  borrowedBooks: [{ type: String }],
  totalBorrowed: { type: Number, default: 0 },
});

module.exports = mongoose.model("Member", memberSchema);
