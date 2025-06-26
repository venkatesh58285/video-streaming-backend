import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    //check owner id and create a playlist doc
    const {name, description} = req.body
    const playlistOwnerId = req.user._id;
    if(!isValidObjectId(playlistOwnerId)) throw new ApiError(400,"Invalid id")
    const playlist =await Playlist.create({
            name,
            desc:description,
            owner:playlistOwnerId
    })
    if(!playlist) throw new ApiError(400,"error in creating playlist")
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)) throw new ApiError(400,"Invalid id");
    const playlist =await Playlist.find({owner:userId});
    if(!playlist) throw new ApiError(404,"Playlist not found")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Fetched particular playlist by userId")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)) throw new ApiError(400,"Invalid id");
    const playlist =await Playlist.find({_id:userId});
    if(!playlist) throw new ApiError(404,"Playlist not found")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Fetched particular playlist by Id")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    //check if this video is actually present
    //check if playlist is created
    //as in the video model we can get the direct link just add it in array of videos
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400,"Invalid id")
    const video =await Video.findById(videoId);
    if(!video) throw new ApiError(404,"video not found")
    const playlist =await Playlist.find({_id:playlistId});
    if(!playlist) throw new ApiError(404,"Playlist not found")
    //thid will only update if video is not present in playlist
    await Playlist.findByIdAndUpdate(playlistId,{$addToSet:{videos:video._id}}); 
    // playlist.videos.push(video._id);  //or there push operator in findByIdAndUpdate
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Added video to plylist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400,"Invalid id")
    const video =await Video.findById(videoId);
    if(!video) throw new ApiError(404,"video not found")
    const playlist =await Playlist.find({_id:playlistId});
    if(!playlist) throw new ApiError(404,"Playlist not found")
    const updatedPlaylist = await Playlist.findByIdAndDelete(playlistId,{
            $pull:{
                videos:videoId
            }
        })
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Playlist updated successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)) throw new ApiError(400,"Invalid id")
    const playlist =await Playlist.find({_id:playlistId});
    if(!playlist) throw new ApiError(404,"Playlist not found")
    await Playlist.deleteOne({_id:playlistId})
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Delted playlist successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)) throw new ApiError(400,"Invalid id")
    const playlist =await Playlist.find({_id:playlistId});
    if(!playlist) throw new ApiError(404,"Playlist not found")
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { 
            name,
            desc:description
        },{
            new:true
        }
    )
    return res  
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"updated name and description"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}