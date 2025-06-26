import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    //find videoId in comments collection get all comments i need comment and user who kept it
    // const commentedBy = await Comment.find({video:videoId}).populate('owner','username avatar fullName');
    const comments =await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"commentedBy",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                commentedBy:{$first:"$commentedBy"}  //get only first element of array
            }
        },
        {
            $skip:(parseInt(page)-1)*parseInt(limit)  //bug costs 50 min
        },
        {
            $limit:parseInt(limit)
        }
    ]);
    if(!comments?.length) throw new ApiError(400,"No comments")
    return res
    .status(200)
    .json(new ApiResponse(200,comments,"Comments of the video fetched"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

    if(!isValidObjectId(videoId)) throw new ApiError(401,"invalid video id");
    // const findVideo =await Comment.findOne({video:videoId}) why do search for a video we are commenting under it
    // if(!findVideo) throw new ApiError(404,"video not found");

    const comment =await Comment.create(
        {
            content,
            video:videoId,
            owner:req.user._id
        }
    );
    if(!comment) throw new ApiError(400,"Failed in posting retry")
    
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"added comment"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;
    if(!isValidObjectId(commentId)) throw new ApiError(401,"Invalid id")
    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404,"no comment found")
    if(!comment.owner.equals(req.user._id)) throw new ApiError(401,"Cant make changes to others data")
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        }
    );
    if(!updatedComment) throw new ApiError(400,"error in comment updation");

    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)) throw new ApiError(401,"Invalid id")
    const comment = await Comment.findById(commentId);
    if(!comment) throw new ApiError(404,"no comment found")
    if(!comment.owner.equals(req.user._id)) throw new ApiError(401,"Cant make changes to others data")
    const deletedComment = await Comment.findByIdAndDelete(
        commentId,
    );
    if(!deletedComment) throw new ApiError(400,"error in comment deletion");
    const deleted = await Comment.findById(commentId)
    return res
    .status(200)
    .json(new ApiResponse(200,deleted,"Comment updated"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }