import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import * as dotenv from "dotenv";
import aiRouter from './routes/aiRoutes';
import connectDB from './utils/connectDB';
import equipmentRouter from './routes/equipmentRoutes';
import MaintenanceHistoryRouter from './routes/maintenanceHistoryRouter';
import { connectToMongoDB } from './db/mongodb';
import { auth } from './utils/auth';
import { toNodeHandler } from "better-auth/node";
import { fromNodeHeaders } from "better-auth/node";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Connect to MongoDB
connectToMongoDB().catch(console.error);

// Better Auth API routes
app.all("/api/auth/*", toNodeHandler(auth));

// Protected API example
app.get("/api/me", async (req, res: any) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Hospiwise Auth Server' });
});
// Connect to MongoDB
connectDB();

app.use(express.json());

// Middleware
app.use(cors({
    origin: '*', // or specify a particular domain for security
}));

app.get('/', (req, res) => {
    res.send('Hello World');  
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/ai', aiRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/maintenance-history', MaintenanceHistoryRouter);



app.use(function (err: any, req: Request, res: Response, next: any) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);  
});