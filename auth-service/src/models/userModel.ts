import mongoose, { Schema } from "mongoose";


export interface IUser {
    userId: string;
    username: string;
    email: string;
    password?: string;
    role : string;
    googleId?: string;
    providers: string[];
}

const UserSchema = new Schema<IUser>(
    {
        userId:{
            type:String,
            required: true,
            unique: true
        },
        username:{
            type: String,
            required: true
        },
        email:{
            type: String,
            unique: true,
            required: true
        },
        password:{
            type: String,
            required: false
        },
        role:{
            type: String,
            required: true,
            enum:["ADMIN","USER"]
        },
        providers:{
            type: [String],
            required: true
        },
        googleId:{
            type: Number,
            required: false,
            unique: true,
            sparse: true
        }
    },
    {
        timestamps: true
    }
);

const UserModel = mongoose.model<IUser>(
    "User",
    UserSchema
)

export default UserModel;