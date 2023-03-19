import mongoose from "mongoose";
mongoose.set('strictQuery', false);

const connectDB = async () => {
    const conn = await mongoose
        .connect(process.env.MONGO_URI, {
            useNewUrlParser: true, useUnifiedTopology: true  
        }
        )
        .then(() => console.log("e don connect"))
        .catch((err) => console.log(err));
}

export default connectDB