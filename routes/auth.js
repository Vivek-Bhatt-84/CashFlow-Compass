import User from "../models/users.js";
import express from "express";

const Router = express.Router()


Router.route("/login")
    .get((req, res) => {
        res.render("login/login");
    })
    .post(async (req, res) => {
        const { email, password } = req.body;
        let user = undefined;
        try {
            user = await User.findOne({ email });
        } catch (err) {
            console.log("Problem finding user");
        }

        if (user && user.password === password) {
            // Store user ID in session
            req.session.userId = user.id;
            req.session.email = user.email;
            req.session.username = user.username;   
            req.session.role = user.role;
            res.redirect("/dashboard");
        } else {
            res.render("login/login", { error: "Invalid username or password" });
        }
    });

Router.post(async (req, res) => {
  try {
    const { fname, lname, mobile, address, username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists." });
    }

    // Create a new user
    const newUser = new User({
      fname,
      lname,
      mobile,
      address,
      username,
      email,
      password,
    });

    // Save the new user to the database
    await newUser.save();

    // Optionally, you can handle additional logic like sending a confirmation email, etc.
    res.redirect("/login");
  } catch (error) {
    // Handle any errors that occur during user creation
    console.error("Error creating user:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});


Router.get("/logout", (req, res) => {
    // Clear the user's session
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ error: "Failed to logout" });
        }
        // Redirect the user to the login page or any other appropriate page after logout
        res.redirect("/");
    });
});


Router.get("/profile", async (req, res) => {
    const { role } = req.session
    try {
        // Check if user is authenticated
        if (!req.session.userId) { // qkn
            // If not authenticated, redirect to login page
            return res.redirect("/login");
        }

        // Fetch user data from the database based on the stored user ID
        const user = await User.findById(req.session.userId);

        // If user not found, handle error
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        // Render the profile page with user data
        res.render("profile/profile", { user, role });
    } catch (error) {
        console.error("Error rendering profile page:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default Router