var mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/ecommerce", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return console.log("Database connected!");
  } catch (err) {
    return console.log(err);
  }
}
module.exports = connectDB
