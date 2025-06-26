import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {ApiError} from '../utils/ApiError.js';
import {Subscription} from '../models/subscription.model.js';
import mongoose from "mongoose";

const SubscribeToChannel = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const channelId = req.params.channelId;
    if(String(userId) == String(channelId)) throw new ApiError(400,'Subscribe to own channel is prohibited')
    if(!channelId) throw new ApiError(400,'Channel not found')
    const info = await Subscription.findOne({subscriber:userId,channel:channelId})
    if(info) throw new ApiError(400,"Already subscibed")
    const details = await Subscription.create({subscriber:userId,channel:channelId})
    return res
    .status(200)
    .json(
        new ApiResponse(200,details,"Suscribed")
    )
})

const UnSubscribeToChannel = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const channelId = req.params.channelId;
    if(!channelId) throw new ApiError(400,'Channel not found')
    const info = await Subscription.findOne({subscriber:userId,channel:channelId})
    if(!info) throw new ApiError(400,"Not subscibed")
    const deleted = await Subscription.findOneAndDelete({subscriber:userId,channel:channelId})
    if(!deleted) throw new ApiError(404,"unable to delete")
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"UnSuscribed")
    )
}) 

const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const user = req.user._id;
    // const subscribers = Subscription.find({user}).populate("subscriber","username email");
    // if(!subscribers?.length) throw new ApiError(404,"User not found")
    // console.log(user);
    const pipelines =await Subscription.aggregate([
        {
            $match: {
                channel:user
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers"
            }
        },
        {$unwind:"$subscribers"},
        {
            $project:{
                "subscribers":1
            }
        }
    ]);
    // console.log(pipelines)
    if(!pipelines?.length){
        throw new ApiError(400,'Subscribers not found')
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,pipelines,"Got all subscribers")
    )

})

const getChannelsSubscribedTo = asyncHandler(async(req,res)=>{
     const user = req.user._id;
     const pipelines =await Subscription.aggregate([
        {
            $match: {
                subscriber:user
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedTo"
            }
        },
        {$unwind:"$subscribedTo"},
        {
            $project:{
               "subscribedTo":1
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,pipelines,"Got all channels subscribed to")
    )

})

export {
    SubscribeToChannel,
    UnSubscribeToChannel,
    getChannelSubscribers,
    getChannelsSubscribedTo
}