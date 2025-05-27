import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Validate environment variable
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not defined");
        }

        // Connection options
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        };

        console.log("Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);

        // Connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (error) => {
            console.error('Mongoose connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
        });

        // Note: Graceful shutdown is handled in app.js to avoid duplicate listeners

        return conn;

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.error('Stack:', error.stack);

        // Specific error handling
        if (error.name === 'MongoNetworkError') {
            console.error('Network error: Please check your MongoDB connection string and network connectivity');
        } else if (error.name === 'MongoAuthenticationError') {
            console.error('Authentication error: Please check your MongoDB credentials');
        } else if (error.name === 'MongoServerSelectionError') {
            console.error('Server selection error: MongoDB server is not reachable');
        }

        throw error; // Re-throw to be handled by caller
    }
};

export default connectDB;