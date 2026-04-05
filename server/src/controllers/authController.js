// const db = require("../config/db");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config(); // Make sure you have JWT_SECRET in .env

// // Utility function to create JWT token
// const createToken = (user) => {
//   return jwt.sign(
//     { id: user.id, username: user.username, email: user.email },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" } // expires in 1 day
//   );
// };

// // ---------------- SIGNUP ----------------
// const signup = async (req, res) => {
//   try {
//     const { name, username, email, password } = req.body;

//     // 1. Check empty fields
//     if (!name || !username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // 2. Validate name length
//     if (name.length > 20) {
//       return res.status(400).json({ message: "Name must not exceed 20 characters" });
//     }

//     // 3. Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     // 4. Check if username already exists
//     const checkUserQuery = "SELECT * FROM users WHERE username = ?";
//     db.query(checkUserQuery, [username], async (err, results) => {
//       if (err) {
//         console.error("Error checking username:", err);
//         return res.status(500).json({ message: "Database error" });
//       }

//       if (results.length > 0) {
//         return res.status(400).json({ message: "Username already exists" });
//       }

//       // 5. Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // 6. Insert new user
//       const insertQuery =
//         "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)";

//       db.query(insertQuery, [name, username, email, hashedPassword], (err, result) => {
//         if (err) {
//           console.error("Error inserting user:", err);
//           return res.status(500).json({ message: "Database error" });
//         }

//         // 7. Create JWT token
//         const newUser = {
//           id: result.insertId,
//           name,
//           username,
//           email,
//         };
//         const token = createToken(newUser);

//         res.status(201).json({
//           message: "User registered successfully 🚀",
//           user: newUser,
//           token,
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Signup Error:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ---------------- SIGNIN ----------------
// const signin = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password are required" });
//     }

//     // Check if user exists
//     db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
//       try {
//         if (err) {
//           console.error("❌ Database error during signin:", err);
//           return res.status(500).json({ message: "Database error" });
//         }

//         if (results.length === 0) {
//           return res.status(404).json({ message: "User not found" });
//         }

//         const user = results[0];

//         // Compare password
//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//           return res.status(401).json({ message: "Invalid credentials" });
//         }

//         // ✅ Create JWT token
//         const token = createToken(user);

//         res.status(200).json({
//           message: "Signin successful 🎉",
//           user: {
//             id: user.id,
//             name: user.name,
//             username: user.username,
//             email: user.email,
//           },
//           token,
//         });
//       } catch (error) {
//         console.error("❌ Error during signin process:", error);
//         res.status(500).json({ message: "Something went wrong while signing in" });
//       }
//     });
//   } catch (error) {
//     console.error("❌ Unexpected error in signin:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// module.exports = { signup, signin };


const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const client = require("../config/mail");
require("dotenv").config();

// Utility function to create JWT token
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // token valid for 1 day
  );
};

// ---------------- SIGNUP ----------------
const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.length > 20) {
      return res.status(400).json({ message: "Name must not exceed 20 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 2️⃣ Check if username already exists
    const [existingUser] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Insert user
    const [result] = await db.execute(
      "INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, username, email, hashedPassword, "user"]
    );

    // 5️⃣ Generate token
    const newUser = { id: result.insertId, name, username, email, role: "user" };

    const token = createToken(newUser);

    res.status(201).json({
      message: "User registered successfully 🚀",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- SIGNIN ----------------
const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // 1️⃣ Check if user exists
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚩 NEW: Only admins or super admins are allowed to login
    if (user.role !== "admin" && user.role !== "super admin") {
      return res.status(403).json({ message: "Access denied. Only authorized personnel can access this website." });
    }

    // 3️⃣ Generate JWT

    const token = createToken(user);

    res.status(200).json({
      message: "Signin successful 🎉",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- CHANGE PASSWORD ----------------
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; 

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);

    res.status(200).json({ message: "Password updated successfully 🎉" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// ---------------- FORGOT PASSWORD ----------------
const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Username not found in our records." });
    }

    const user = rows[0];
    const newTempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

    const sendSmtpEmail = {
      to: [{ email: user.email }],
      sender: { email: process.env.EMAIL_USER || "noreply@event-team.com", name: "Event Team" },
      subject: "Your New Temporary Password 🔑",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2c3e50;">Hello ${user.name},</h2>
          <p>You have requested a password reset for your account (<strong>${user.username}</strong>).</p>
          <div style="background-color: #f8f9fa; border-left: 5px solid #3498db; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">Your new temporary password is: <strong style="color: #e74c3c;">${newTempPassword}</strong></p>
          </div>
          <p>Please log in using this temporary password and change it immediately from your profile dashboard for security reasons.</p>
          <p style="margin-top: 30px;">Best Regards,<br><strong>Team Food Coupons</strong></p>
        </div>
      `,
    };

    await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: "A temporary password has been sent to your registered email address." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, signin, changePassword, forgotPassword };

