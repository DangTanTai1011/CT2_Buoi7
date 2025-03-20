const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'superSecretKeyForSession',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ MongoDB connected");

    User.findOne({ role: "admin" })
        .then(admin => {
            if (!admin) {
                const adminUser = new User({
                    username: "admin",
                    email: "admin@example.com",
                    password: "admin123",
                    role: "admin"
                });
                adminUser.save()
                    .then(() => console.log("Admin user created"))
                    .catch(err => console.error("Error creating admin", err));
            }
        })
        .catch(err => console.error("Error checking for admin", err));
}).catch(err => console.error("❌ MongoDB connection error:", err));

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API! Use /auth for authentication routes" });
});

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
