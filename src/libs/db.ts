import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URL;

        if (!uri) {
            throw new Error('MONGODB_URI environment variable not found');
        }

        // Checking for existing connections
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Configure Mongoose connection options
        const options: mongoose.ConnectOptions = {
            // Other options as needed
        };

        await mongoose.connect(uri, options);
        
        console.log('Database connected');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};