import dotenv from 'dotenv';  
dotenv.config(); 
import connectDatabase from './config/database.js';
import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
/* 
cloudinary.config({ 
  cloud_name: 'devdiggi', 
  api_key: '895791127296488', 
  api_secret: 'NQg5Cuxi-wmmM91kdFrXPa9gHFA' 
}); */
 
connectDatabase();

import app from './app.js';
 

app.listen(process.env.PORT, () => {
console.log(`Server is running on port http://localhost:${process.env.PORT}`);
 });