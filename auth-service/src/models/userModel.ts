import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
    userId: string;
    username: string;
    email: string;
    password?: string;
    role: string;
    googleId?: string;
    providers: string[];
    avatar?: string;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: false
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER"
        },
        providers: {
            type: [String],
            default: ["local"]
        },
        googleId: {
            type: String,
            required: false,
            unique: true,
            sparse: true
        },
        avatar: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const UserModel = mongoose.model<IUserDocument>(
    "User",
    UserSchema
);

export default UserModel;