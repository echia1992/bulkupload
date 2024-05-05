import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    name: {
        type:String,
    },
     color: {
        type:String,
    },
      category: {
        type:String,
    },
       price: {
        type:Number,
    },
}, { timestamps: true })

const Product = mongoose.models.Products || mongoose.model("Products", productSchema);

export default Product;