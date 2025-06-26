import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)) throw new ApiError(401,"Invalid id")
    let video = await Like.findOne({likeBy:req.user?._id,video:videoId});  //d
    // console.log(video)
    let liked="";
    if(!video) {
        await Like.create(
           { 
            video:videoId,
            likeBy:req.user._id
        }
        );
        liked = "Video Liked";
    }
    else{
         await Like.findOneAndDelete({likeBy:req.user?._id,video:videoId});  
         liked = "Video unliked";
    }
    const totLikes =await Like.countDocuments({video:videoId})
    return res
    .status(200)
    .json(new ApiResponse(200,{liked,totLikes},"toggled video like"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)) throw new ApiError(401,"Invalid id")
    let comment = await Like.findOne({likeBy:req.user?._id,comment:commentId});
    let liked="";
    if(!comment) {
        await Like.create(
           { 
            comment:commentId,
            likeBy:req.user._id
           }
        );
        liked = "Comment Liked";
    }
    else{
         await Like.findOneAndDelete({comment:commentId,likeBy:req.user._id});
         liked = "Comment unliked";
    }
    const totLikes =await Like.countDocuments({comment:commentId})
    return res
    .status(200)
    .json(new ApiResponse(200,{liked,totLikes},"toggled comment like"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)) throw new ApiError(401,"Invalid id")
    let tweet = await Like.findOne({likeBy:req.user?._id,tweet:tweetId});
    let liked="";
    if(!tweet) {
        await Like.create(
           { 
            tweet:tweetId,
            likeBy:req.user._id
           }
        );
        liked = "Tweet Liked";
    }
    else{
         await Like.findOneAndDelete({tweet:tweetId,likeBy:req.user._id})
         liked = "Tweet unliked";
    }
    const totLikes =await Like.countDocuments({tweet:tweetId});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{liked,totLikes},"toggled tweet like")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;
    // console.log(userId);
    const Find = await Like.findOne({likeBy:userId});
    if(!Find) throw new ApiError(400,"No Liked Videos")
    const likedVideos = await Like.aggregate([
  {
    $match: {
      likeBy: userId,
    },
  },
  {
    $lookup: {
      from: "videos",
      localField: "video",
      foreignField: "_id",
      as: "likedVideoDetails",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "video_owners",
            pipeline: [
              {
                $project: {
                  username: 1,
                  avatar: 1,
                  fullName: 1,
                }
              },
            ],
          },
        },
        {
          $addFields: {
            video_owners: { $first: "$video_owners" },
          },
        },
        {
          $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            duration: 1,
            desc: 1,
            video_owners: 1,
          },
        },
      ],
    },
  },
  {
    $unwind: "$likedVideoDetails",
  },
  {
    $project:{
        likedVideoDetails:1,
        video:1,
        likeBy:1
    }
  },
]);


    if(!likedVideos?.length) throw new ApiError(400,"No videos found")
    return res
    .status(200)
    .json( new ApiResponse(200,likedVideos,"Fetched liked videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}