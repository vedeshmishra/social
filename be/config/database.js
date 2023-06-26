
import mongoose from 'mongoose';   
const connectDatabase = async () => {
  try { 
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${db.connection.host}`);
    }
    catch (error) {
      console.log(`Error: MongoDB Not Connected: ${error}`);
    }
    
};
export default connectDatabase;

