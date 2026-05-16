const mongoose = require("mongoose");

// Cache the connection across serverless invocations
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

module.exports.connectToMongoDB = async () => {
  const MONGODB_ATLAS_CONNECTION = process.env.MONGODB_ATLAS_CONNECTION;
  const currentEnv = process.env.NODE_ENV;

  // Reuse existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Wait for in-progress connection instead of making a new one
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_ATLAS_CONNECTION, {
        family: 4,
        bufferCommands: false, //  don't queue queries before connection
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then(m => {
        console.log(`Connected to ${currentEnv} database`);
        return m;
      })
      .catch(err => {
        cached.promise = null; // reset so next request can retry
        console.error("DB connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
