const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const user1 = require("./routes/user");
const gym = require("./routes/gym");
const serveFront = require("./routes/serveFront");
const logger = require("./utils/logger");

dotenv.config();
const app = express();
const Port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow data fetching from different origins
app.use(express.json()); // Parse JSON body requests
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/user", user1);
app.use("/gym", gym);
app.use("/", serveFront);
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});


logger.info(`✅ Server starting on port ${Port}...`);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(Port, () => {
      logger.info(`✅ Server is listening on port ${Port}...`);
    });
  })
  .catch((err) => {
    logger.error("❌ Database connection error:", err);
  });

console.log("blwja");//legends say blwja was better than winston 

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
