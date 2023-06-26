
import express from 'express';
const app = express();
import cookieParser from 'cookie-parser'; 
import cors from 'cors';

app.use(cors());
 
 



//using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//importing routes

import post  from './routes/post.js'; 
import user from './routes/user.js'; 

app.use('/api/v1', post);
app.use('/api/v1', user);

export default app;