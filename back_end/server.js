const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const app = express();

// Serve static files
app.use(
  express.static(path.join(__dirname, "../front_end"), {
    dotfiles: "ignore",
    index: "index.html",
  })
);

// Serve frontend index.html
app.get("/", (req, res) => {
  res
    .status(200)
    .sendFile(path.join(__dirname, "../front_end/pages/index.html"));
  console.log("Frontend served");
});

// Connect to MongoDB before starting the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Stop server on DB failure
  });
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await mongoose.disconnect();
  process.exit(0);
});
