import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/v1/models/product/Product.mjs";
import connectDB from "./db/connectDB.mjs";

dotenv.config();

const inspect = async () => {
  try {
    await connectDB();
    const products = await Product.find().limit(3).lean();
    console.log("--- DATABASE INSPECTION ---");
    products.forEach((p) => {
      console.log(
        `Product: ${p.title} | Price: ${p.price} (${typeof p.price}) | Seller: ${p.seller} (${typeof p.seller})`
      );
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspect();
