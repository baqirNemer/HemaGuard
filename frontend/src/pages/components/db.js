const mongoose = require("mongoose");
const db =
  "mongodb+srv://baqirnemer:123@db.zuvlwa8.mongodb.net/";
/* Replace <password> with your database password */

mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB is Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;