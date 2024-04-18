const Mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await Mongoose.connect(
      "mongodb+srv://samhithak28:u1rGVrbzwyoF01bv@cluster0.goxmozo.mongodb.net/"
    );
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Connection Failed", error.message);
  }
};

dbConnect();
