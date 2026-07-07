import jwt from "jsonwebtoken";

export function generateToken(user: any) {
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