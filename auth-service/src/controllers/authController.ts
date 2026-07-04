import type { Request, Response } from "express";
import  authService  from "../services/authService.js";
import googleService from "../services/googleService.js";

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface GoogleBody {
    idToken: string;
}

export const register = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response
): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        const result = await authService.register(
            username,
            email,
            password
        );

        res.status(201).json(result);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(
            email,
            password
        );

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};

export const googleLogin = async (
    req: Request<{}, {}, GoogleBody>,
    res: Response
) => {
    try {
        const { idToken } = req.body;

        const result = await googleService.googleAuth(idToken);

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error desconocido",
        });
    }
};