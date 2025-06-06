import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { database } from './configs/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initializeSocket } from './services/socket.service';

dotenv.config();

const app: Express = express();
const port: number = parseInt(process.env.PORT || '5000', 10);
const corsOptions ={
    origin:'http://localhost:5173', 
    credentials:true,         
    optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = createServer(app);
const io = initializeSocket(httpServer);
app.set('io', io);

const startServer = async () => {
  try {
    await database.connect();
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();