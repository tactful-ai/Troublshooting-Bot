require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const User = require("../models/user");
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.GPASSWORD,
  },
});

app.post("/userData", async (req, res) => {
  const { email: userEmail, question: userQuestion } = req.body;

  try {
    // Create a new user record in the database
    await User.create({
      email: userEmail,
      question: userQuestion,
    });

    // Create email message
    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Your question has been received ${userQuestion}`,
      text: "We contact you Soon",
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Email sent successfully");
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

app.get("/response-form", (req, res) => {
  res.render("responseForm"); // Use your templating engine (e.g., EJS, Pug) to render the HTML
});

app.post("/response", async (req, res) => {
  const { email: userEmail, response: userResponse } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    const userQuestion = user.question;

    if (!user) {
      return res.status(404).send("User not found");
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: "Your Question Response",
      text: `Your Question ${userQuestion}Here is the response to your question ${userResponse}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error sending email response");
      } else {
        console.log("Email response sent: " + info.response);
        res.status(200).send("Email response sent successfully");
      }
    });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

app.post("/verification-code", (req, res) => {
  const { email } = req.body;

  // Generate a random verification code (you can use a library like crypto)
  const verificationCode = Math.floor(1000 + Math.random() * 9000);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send verification code" });
    } else {
      console.log("Email sent: " + info.response);
      res.json({ message: "Verification code sent successfully" });
    }
  });
});
module.exports = app;
