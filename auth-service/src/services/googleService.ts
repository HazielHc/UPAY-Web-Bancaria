import UserModel from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import { googleClient } from "../config/google.js";
import { generateToken } from "./tokenService.js";
import type { TokenPayload } from "google-auth-library";

class GoogleService {

    async googleValidation(
        idToken: string
    ): Promise<TokenPayload & { email: string }> {
        const clientId = process.env.GOOGLE_CLIENT_ID;

        if (!clientId) {
            throw new Error("GOOGLE_CLIENT_ID no está definida");
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: clientId,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new Error("Token de Google inválido");
        }

        if (!payload.email_verified) {
            throw new Error("El correo no está verificado");
        }

        return payload as TokenPayload & { email: string };
    }

    async googleAuth(idToken: string) {
        const payload = await this.googleValidation(idToken);

        let user = await UserModel.findOne({
            email: payload.email,
        });

        if (!user) {
            user = new UserModel({
                userId: uuidv4(),
                username: payload.name,
                email: payload.email,
                password: null,
                role: "USER",
                providers: ["google"],
                googleId: payload.sub,
                avatar: payload.picture,
            });

            await user.save();
        }
        else if (!user.providers.includes("google")) {
            user.providers.push("google");
            user.googleId = payload.sub;
            if (payload.picture) {
                user.avatar = payload.picture;
            }

            await user.save();
        }

        const token = generateToken(user);

        return {
            message: "Autenticación con Google exitosa",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        };
    }
}

export default new GoogleService();