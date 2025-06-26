import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy='createdAt', sortType='desc', userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    //either query is a title of video or disc of video
    const videos =await Video.aggregate([
        {
            $match:{
            $or:[
                {
                    owner:userId
                },
                {
                    title:{$regex:query,$options:'i'}
                },
                {
                    discription:{$regex:query,$options:'i'}
                }
            ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"createdBy",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
           $addFields: {
                createdBy: {
                 $first: "$createdBy",
                },
            },
        },
        {
            $project:{
                videoFile:1,
                title:1,
                disc:1,
                createdBy:1,
                thumbnail:1
            }
        },
        {
            $sort:{[sortBy]:sortType=="asc"?1:-1}  //sorts order
        },
        {
            $skip: (parseInt(page) - 1) * parseInt(limit)  //skip other docs to next page
        },
        {
            $limit: parseInt(limit),  //limits documents
    }   ,
    ])
    if(!videos?.length) throw new ApiError(400,"there is an error in getting videos")

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,'Fetched videos')
    )
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title && !description) throw new ApiError(400,'all deatils are required')
    const videoFilePath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnail[0].path;
    if(!videoFilePath && !thumbnailPath) throw new ApiError(400,"all files are required")
    const video = await uploadCloudinary(videoFilePath);
    const thumbnail = await uploadCloudinary(thumbnailPath);
    if(!video && !thumbnail) throw new ApiError(400,"error in uploading to cloudinary")
    const duration = video?.duration;

    const v =await Video.create({
        title,
        description:description,
        videoFile:video.url,
        thumbnail:thumbnail.url,
        duration,
        owner:req.user._id
    })
    
    return res
        .status(200)
        .json(new ApiResponse(200,v,'Video is published'))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!mongoose.Types.ObjectId.isValid(videoId)) throw new ApiError(400,"incorrect id");
    const video =await Video.findById(videoId).populate('owner');
    if(!video) throw new ApiError(404,'Video not found');
    
    return res
    .status(200)
    .json(new ApiResponse(200,video,'Fetched Video details'))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)) throw new ApiError(400,'Video Id is not valid')
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404,"Video not found")
    const access = await Video.find({owner:req.user._id})
    if(!access) throw new ApiError(401,"cant update");
    const thumbnailFilePath = req.file.path;
    if(!thumbnailFilePath) throw new ApiError(404,'problem in file uploading')
    console.log(thumbnailFilePath)
    const thumbnail = await uploadCloudinary(thumbnailFilePath);
    console.log(thumbnail.url);
    const update =await Video.findByIdAndUpdate(videoId,{$set:{thumbnail:thumbnail.url}})
    return res
    .status(200)
    .json(
        new ApiResponse(200,update,"thumbnail updated")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)) throw new ApiError(400,"id is invalid")
    const access = await Video.find({owner:req.user._id})
    if(!access) throw new ApiError(401,"cant delete");
    const video = await Video.findByIdAndDelete(videoId);
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"deleted video successfully")
    )
})

const togglePublishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) throw new ApiError(400,"id is invalid")
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404,'Video not found')
    video.isPublished = !video.isPublished;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,'Toggled successfully')
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishVideo
}