import { Request, Response } from "express";

export const registrer = async(
    req: Request, 
    res: Response
) => {
    const {username, email, password} = req.body;
}