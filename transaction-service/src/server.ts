import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { pool } from './config/db';
import transactionRoutes from './routes/transaction.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/transactions', transactionRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno del server' });
});

const PORT = Number(process.env.PORT) || 5000;

async function start() {
    try {
        await pool.query('SELECT 1');
        console.log('Se conecto correctamente a MySQL');
        app.listen(PORT, () => console.log(`Servidor de transaction-service on :${PORT}`));
    } catch (err) {
        console.error('No se conecto a MySQL', err);
        process.exit(1);
    }
}

start();
