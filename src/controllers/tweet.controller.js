import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Tweet} from "../models/tweet.model.js";

const postTweet = asyncHandler(async(req,res)=>{
    const { content } = req.body;
    // console.log(content);
    const user = req.user?._id;
    if(!user) throw new ApiError(400,"Register first");
    
    const tweet =await Tweet.create(
        {
            content:content,
            owner:user
        }
    )
    if(!tweet) throw new ApiError(400,"problem in creating tweet")
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,'Tweet created suceessfully')
    )
})

const getUserTweets = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    if(!isValidObjectId(userId)) throw new ApiError(400,"Invalid user id");

    const tweets =await Tweet.find({owner:userId}).populate('owner','username fullName, avatar').sort({createdAt:-1});

    if(!tweets?.length) throw new ApiError(400,"No Tweets")
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,'Tweets fetched successfully')
    )
})

const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const {content} = req.body;
    const tweet =await Tweet.findById(tweetId);
    if(!isValidObjectId(tweet) || !tweet) throw new ApiError(400,"invalid id or tweet not found")
    const userId = req.user._id;
    const valid = await Tweet.findOne({
        _id:tweet._id,
        owner:userId
    })
    if(!valid) throw new ApiError(401,'no permissions to update')
    
    tweet.content = content;
    await tweet.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,'Updated tweet')
    )
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const userId = req.user._id;
    const tweett =await Tweet.findById(tweetId);
    if(!isValidObjectId(tweett) || !tweett) throw new ApiError(400,"invalid id or tweet not found")
    if(!tweett.owner.equals(userId)) throw new ApiError(401,'no permissions to delete')
    await Tweet.findOneAndDelete(
        {_id:tweetId},
    );
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},'Tweet Delted')
    )
})

export {
    postTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};