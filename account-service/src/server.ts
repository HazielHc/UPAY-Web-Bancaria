import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { pool } from './config/db';
import accountRoutes from './routes/account.routes';
import cardRoutes from './routes/card.route';
import internalRoutes from './routes/balance.route';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/accounts', accountRoutes);
app.use('/accounts/:accountId/cards', cardRoutes);

app.use('/internal', internalRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 4000;

async function start() {
    try {
        await pool.query('SELECT 1');
        console.log('Connected to MySQL');
        app.listen(PORT, () => console.log(`Servidor de account en : http://localhost:${PORT}`));
    } catch (err) {
        console.error('Could not connect to MySQL', err);
        process.exit(1);
    }
}

start();
