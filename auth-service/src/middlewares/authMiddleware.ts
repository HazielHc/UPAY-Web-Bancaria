import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const authMiddlewares = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        );

        req.user = decoded;

        next();

    } catch(error){
        return res.status(401).json({
            message: "Token invalido"
        });
    }
};