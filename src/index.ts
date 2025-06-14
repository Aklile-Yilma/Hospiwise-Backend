import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import * as dotenv from "dotenv";
import aiRouter from './routes/aiRoutes';
import equipmentRouter from './routes/equipmentRoutes';
import failureReportRoutes from './routes/failureReportsRoutes';
import MaintenanceHistoryRouter from './routes/maintenanceHistoryRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));


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
app.use('/api/failure-reports', failureReportRoutes);


app.use(function (err: any, req: Request, res: Response, next: any) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);  
});