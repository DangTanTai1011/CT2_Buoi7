const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authMiddleware = async (req, res, next) => {
    try {
        const token = req.session.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Access Denied" });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(verified.id).select("-password");

        if (!req.user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};
