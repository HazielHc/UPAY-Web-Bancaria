import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import cors from "cors"

dotenv.config();

await connectDB(); 

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor de auth en:  http://localhost:${PORT}`);
});