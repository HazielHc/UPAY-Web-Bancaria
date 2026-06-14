import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import testRoutes from "./routes/testRoutes.js"

dotenv.config();

await connectDB(); 

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(testRoutes);

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});