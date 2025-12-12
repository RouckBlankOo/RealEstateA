require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("../src/api/utils/logger");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/RealEstate";

const connectDB = async () => {
  try {
    mongoose.connect(MONGODB_URI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    logger.info("🟢 MONGO CONNECTED");
  } catch (error) {
    console.log("MONGO FAILED ⚠️");
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
