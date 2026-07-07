import mongoose from "mongoose";

export const connectDB = async (): Promise<void> =>{
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI no definida");
    }

    try{
        await mongoose.connect(uri);

        console.log("Mongo conected");
    }catch(error){
        if(error instanceof Error){
            console.error(error.message);
        }
        process.exit(1);
    }
};
