import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { database } from './configs/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'

// Load environment variables
dotenv.config();

// Initialize express app
const app: Express = express();
const port: number = parseInt(process.env.PORT || '5000', 10);
const corsOptions ={
    origin:'http://localhost:5173', 
    credentials:true,         
    optionSuccessStatus:200
}

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Mount routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await database.connect();
    app.listen(port);
    console.log(`🚀 Server running on port ${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();