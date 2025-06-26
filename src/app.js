import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'; //debug
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'))
app.use(cookieParser());
// app.use(cors()); //alow all
// var whitelist = ['http://localhost:5000', 'http://example2.com']
// var corsOptions = {
//     origin:function(origin,callback){
//         if(!origin || whitelist.includes(origin)){
//             callback(null,true)
//         }
//         else{
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }
app.use(cors());
app.get('/',(req,res)=>{
   res.send("working");
})

import userRouter from "./routes/user.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import videoRouter from "./routes/video.route.js";
import tweetRouter from './routes/tweet.route.js';;
import playlistRouter from './routes/playlist.route.js';
import commentRouter from './routes/comment.route.js';
import likeRouter from "./routes/like.route.js";
app.use('/api/v1/users',userRouter);
app.use('/api/v1/subscriptions',subscriptionRouter);
app.use('/api/v1',videoRouter);
app.use('/api/v1/tweet',tweetRouter);
app.use('/api/v1/playlist',playlistRouter);
app.use('/api/v1/comment',commentRouter);
app.use('/api/v1/like',likeRouter);

export {app};