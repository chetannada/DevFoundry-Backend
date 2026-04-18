const mongoose = require("mongoose");

module.exports.connectToMongoDB = () => {
  // Connect to MongoDB Atlas using the connection string from environment variables
  const MONGODB_ATLAS_CONNECTION = process.env.MONGODB_ATLAS_CONNECTION;
  const currentEnv = process.env.NODE_ENV;

  mongoose
    .connect(MONGODB_ATLAS_CONNECTION, {
      family: 4,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    })
    .then(() => console.log(`✅ Connected to ${currentEnv} database`))
    .catch(error => console.log(error, "database connection error"));
};
