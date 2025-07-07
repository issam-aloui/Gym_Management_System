const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const user1 = require("./routes/user");
const gym = require("./routes/gym");
const serveFront = require("./routes/serve-front");
const logger = require("./utils/logger");
const helmet = require("helmet");
const servicesm = require("./routes/services");
const gymjoin = require("./routes/gymjoin");
const paypalRoutes = require("./routes/paypal");
const path = require("node:path");
const servicesr = require("./routes/reviews");
const checkin = require("./routes/check-in");
const annoucementsi = require("./routes/announcement");
const cron = require("node-cron");
const Statistiques = require("./models/statistiques");
dotenv.config();
const app = express();
const Port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow data fetching from different origins
app.use(express.json()); // Parse JSON body requests
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../front_end/pages/views"));
app.use("/auth", authRoutes);
app.use("/joingym", gymjoin);
app.use("/reviews", servicesr);
app.use("/user", user1);
app.use("/gym", gym);
app.use("/announcements", annoucementsi);
app.use("/scan", checkin);
app.use("/services", servicesm);
app.use("/paypal", paypalRoutes);
app.use("/", serveFront);
app.use((request, response, next) => {
  logger.info(`${request.method} ${request.url} - ${request.ip}`);
  next();
});

app.use(helmet());

logger.info(`✅ Server starting on port ${Port}...`);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(Port, () => {
      logger.info(`✅ Server is listening on port ${Port}...`);
    });
  })
  .catch((error) => {
    logger.error("❌ Database connection error:", error);
  });
cron.schedule("0 0 * * *", async () => {
  try {
    await Statistiques.updateMany(
      {},
      {
        $set: {
          dailyCheckIns: 0,
          newSignUps: 0,
        },
      }
    );
    console.log("✅ Daily stats reset");
  } catch (error) {
    console.error("❌ Error resetting daily stats:", error.message);
  }
});

cron.schedule("0 0 1 * *", async () => {
  try {
    await Statistiques.updateMany(
      {},
      {
        $set: {
          monthlyRevenue: 0,
        },
      }
    );
    console.log("✅ Monthly revenue reset");
  } catch (error) {
    console.error("❌ Error resetting monthly revenue:", error.message);
  }
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
