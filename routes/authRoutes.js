const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        user = new User({
            username,
            email,
            password,
            role: role || "user"
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully, please login" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.password !== password) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        req.session.token = token;

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/changePassword", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== currentPassword) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/resetPassword/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = "123456";
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
