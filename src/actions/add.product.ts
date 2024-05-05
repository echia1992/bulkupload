"use server"

import { connectDB } from "@/libs/db"
import Product from "@/model/product";
import { revalidatePath } from "next/cache";

export type ProductProps = {
    id:string,
    name: string,
    color: string,
    category: string
    price:number
}

export async function getProducts() {
    try {
        await connectDB();
        const products = await Product.find();
        return products;
    } catch (error) {
        console.log(error);
    }
}

export async function createProducts(data: ProductProps) {
    try {
        await connectDB();
        // Check if a product with the same name, color, category, and price already exists
        const existingProduct = await Product.findOne({
            name: data.name,
            color: data.color,
            category: data.category,
            price: data.price
        });

        if (existingProduct) {
            return "Product already exists"; // Return a message indicating that the product already exists
        } else {
            // If the product doesn't exist, create it
            const newProduct = await Product.create(data);
              revalidatePath("/")
            return newProduct;
        }
    } catch (error) {
        console.log(error);
        return error; // Handle the error appropriately
    }
}

export async function createBulkProducts(products: ProductProps[]) {
    try {
        await connectDB();
        const existingProducts: ProductProps[] = [];
        const createdProducts: ProductProps[] = [];

        // Iterate through each product in the array
        for (const product of products) {
            // Check if a product with the same name, color, category, and price already exists
            const existingProduct = await Product.findOne({
                name: product.name,
                color: product.color,
                category: product.category,
                price: product.price
            });

            if (existingProduct) {
                // If the product already exists, add it to the existingProducts array
                existingProducts.push(product);
            } else {
                // If the product doesn't exist, create it and add it to the createdProducts array
                const newProduct = await Product.create(product);
              
                createdProducts.push(newProduct);
                  revalidatePath("/")
            }
            
        }

        // Construct a message indicating which products were not created because they already exist
        let message = "";
        if (existingProducts.length > 0) {
            message += "The following products already exist and were not created:\n";
            existingProducts.forEach((product) => {
                message += `Name: ${product.name}, Color: ${product.color}, Category: ${product.category}, Price: ${product.price}\n`;
            });
        }

        // Return an object containing the created products and the message
        return {
            createdProducts,
            message
        };
    } catch (error) {
        console.log(error);
        return error; // Handle the error appropriately
    }
}



export async function deleteProduct() {
    try {
        await connectDB();
        const product = Product.deleteMany();
    } catch (error) {
        console.log(error);
    }
}
