import UserModel from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
import { googleClient } from "../config/google.js";

class AuthService {


    async googleLogin(idToken: string) {
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

    if (!user.providers.includes("google")) {
        user.providers.push("google");
        user.googleId = payload.sub;
        if (payload.picture) {
            user.avatar = payload.picture;
        }

        await user.save();
    }

    const token = this.generateToken(user);

    return {
        message: "Login con Google exitoso",
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
        },
    };
}

    async register(
        username: string,
        email: string,
        password: string
    ) {
        const existingUser = await UserModel.findOne({
            email
        });

        if (existingUser) {
            throw new Error("Email already exists");
        }
        
        const hashedPassword = await bcrypt.hash(
            password,
            10
        )

        const user = new UserModel({
            userId: uuidv4(),
            username,
            email,
            password : hashedPassword,
            role: "USER",
            providers: ["local"]
        });

        await user.save();

        return {
            message: "User created successfully",
            userId: user.userId
        };
    }

    private generateToken(user: any) {
        return jwt.sign(
            {
                userId: user.userId,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d"
            }
        );
    }

    async login(
        email: string,
        password : string
    ){
        const existingUser = await UserModel.findOne({
            email
        });

        if (!existingUser){
            throw new Error("Error al iniciar sesion")
        }

        if(!existingUser.providers.includes("local")){
            throw new Error("Credenciales invalidas");
        }

        if (!existingUser.password) {
            throw new Error("Credenciales inválidas");
        }

        const isMatch = await bcrypt.compare(
            password,
            existingUser.password
        )

        if (!isMatch) {
            throw new Error("Credenciales inválidas");
        }

        const token = this.generateToken(existingUser);

        return {
            message: "Login exitoso",
            token,
            user:{
                id: existingUser._id,
                email: existingUser.email,
                role: existingUser.role
            }
        };
    }
}

export default new AuthService();