import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import ratesRoutes from './modules/rates/rates.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/rates', ratesRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor interno' });
});

const PORT = Number(process.env.PORT) || 6000;

app.listen(PORT, () => console.log(`currency-service en :${PORT}`));
