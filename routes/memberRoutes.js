const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// GET all members
router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "All") query.membershipStatus = status;
    
    const members = await Member.find(query).sort({ joinDate: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET member stats
router.get("/stats/overview", async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ membershipStatus: "active" });
    const inactive = await Member.countDocuments({ membershipStatus: "inactive" });
    const suspended = await Member.countDocuments({ membershipStatus: "suspended" });
    
    res.json({ total, active, inactive, suspended });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD
router.post("/", async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
