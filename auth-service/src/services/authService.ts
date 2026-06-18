import UserModel from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";

class AuthService {
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