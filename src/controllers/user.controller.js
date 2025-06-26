import mongoose from 'mongoose';
import {asyncHandler} from '../utils/asyncHandler.js';
import {uploads} from '../middlewares/multer.middleware.js';
import {uploadCloudinary} from '../utils/cloudinary.js';
import {User} from '../models/user.models.js';
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';

const options={    //this options enables only server can change tokens but client cant modify them
      httpOnly:true,
      secure:true
   }

const generateToken =async(userId)=>{
  try{
    const user = await User.findById(userId);
   if(!user){
      throw new ApiError(404,"User not found to send refreshToken");
   }
   const accessToken =  user.generateAccessToken();
   const refreshToken =  user.generateRefreshToken();
   user.refreshToken = refreshToken;
   await user.save({validateBeforeSave:false})
   return {accessToken,refreshToken};
  }
  catch(err){
   throw new ApiError(500,'internal server error');
  }
}

const RegisterUser = asyncHandler(async (req,res)=>{
   //get user details from frontend
   //check if all fields are entered validation
   //check if user is already logged in
   //use cloudinary for uploading avatar coverImage
   //create user object and also send data into database using create
   //remove password and refreshToken from object and send response
   //return response

   const {username,email,fullName,password} = req.body;
   //  console.log(req.body);
   if([username,email,fullName,password].some((field)=>field?.trim() === "")){
    throw new ApiError(400,"All fileds are required");
   }

   const logged =await User.findOne({
    $or : [{email},{username}]
   })
   if(logged){
    throw new ApiError(409,"Already registered");
   }

   const avatarPath = req.files?.avatar[0]?.path;   //as multer middleware is included new methods get enabled
//    const coverImagePath = req.files?.coverImage[0]?.path;
   // console.log(req.files); got fieldname filename path originalname 
   let coverImagePath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImagePath = req.files.coverImage[0].path;
   }
   if(!avatarPath){
    throw new ApiError(400,"Avatar is required");
   }

   const avatar =await uploadCloudinary(avatarPath);    //got url format resource_type height width original_filename
   const coverImage = await uploadCloudinary(coverImagePath);   //d2
   if(!avatar){
    throw new ApiError(400,"Avatar is required");
   }

   const user =await User.create({
    username,
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url||" ",
    password
   })
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   );
   if(!createdUser){
    throw new ApiError(500,"User not Registered internal server error");
   }
   
   return res.status(200).json(
    new ApiResponse(202,"Registered Successfully")
   )
   
})

const LoginUser = asyncHandler(async (req,res)=>{
   //get data from frontend
   //validation
   //matches first email and then password
   //access and refresh token send to fe through cookies res.cookie(name,val,options)
   //return response
   const {email,password} = req.body;
   
   if(!email){
      throw new ApiError(400,"Email is required");
   }

   const user = await User.findOne({email});
   if(!user){
      throw new ApiError(404,"User not found");
   }
   const isPasswordValid =await user.isPasswordCorrect(password);
   if(!isPasswordValid){
      throw new ApiError(401,"invalid credentials");
   }
   
   const {refreshToken,accessToken} = await generateToken(user._id);
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   return res
   .status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refreshToken',refreshToken,options)
   .json(
      new ApiResponse(200,
       {user:loggedInUser,
       refreshToken,
       accessToken},
       "user logged in successfully"
      )
   );
})


const LogoutUser = asyncHandler(async(req,res)=>{
   //remove refreshTOken from db
   //send res
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const generateNewRefreshToken = asyncHandler(async(req,res)=>{
   //get refresh token from cookie
   //find user and set new refreshToken in db through generateToken
   //send response to client
   const token = req.cookies?.refreshToken;
   if(!token) throw new ApiError(401,'Unauthorized');
   const decoded = jwt.verify(token,process.env.REFRESH_TOKEN);
   // console.log(decoded);
   const user =await User.findById(decoded._id);
   if(!user) throw new ApiError(404,"invalid credentials user not found");

   if(user.refreshToken != token) throw new ApiError(401,'Unauthorized');

   const {refreshToken,accessToken} =await generateToken(user._id);  //d await
   console.log(refreshToken);
   return res
   .status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refreshToken',refreshToken,options)
   .json(new ApiResponse(
      200,
      {refreshToken,accessToken},
      "Access Token refreshed"
   ))
})

const updatePassword = asyncHandler(async (req,res)=>{
   const {oldPass,newPass} = req.body;
   if(!oldPass && !newPass) throw new ApiError("All fields are required");

   const user = await User.findById(req.user?._id);
   const validate =await user.isPasswordCorrect(oldPass);
   if(!validate) throw new ApiError(400,"invalid old password");

   user.password = newPass;
   await user.save({
      validateBeforeSave:false
   })
   // console.log(user);
   return res
          .status(200)
          .json(
            new ApiResponse(200,{},"Password changed successfully")
          )
} )

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req ,res) =>{
   //get avatarPath and newOne and replace it by sending to cloudinary
   const avatarPath = req.file?.path;
   // console.log(avatarPath)
   const avatar = await uploadCloudinary(avatarPath);
   if(!avatar) throw new ApiError(400,'error in uploading')

   const user =await User.findByIdAndUpdate(req.user?._id,
      {
         $set:{
            avatar:avatar.url
         }
      },
      {
         new:true
      }
   )
   return res
   .status(200)
   .json(
      new ApiResponse(200,user,"avatar updated successfully")
   )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{  
   //getting username
   //writing aggregation pipelines for user profile
   //sending mess to frontend as well in pipelines
   //return res

   const {username} = req.params;
   if(!username) throw new ApiError(400,'username is missing')
   
   const channel =await User.aggregate(
      [
         {
            $match: {
               username:username
            }
         },
         {
            $lookup:{
               from: "subscribers",
               localField: "_id",
               foreignField: "channel",
               as: "subscibers"
            }
         },
         {
            $lookup:{
               from: "subscribers",
               localField: "_id",
               foreignField: "subscriber",
               as: "subscribedTo"
            }
         },
         {
            $addFields:{
               subscribersCount:{
                  $size: {$ifNull:["$subscibers",[]]}
               },
               subscribedTosCount:{
                  $size: {$ifNull:["$subscibedTo",[]]}
               },
               isSubscribed:{
                  $cond:{
                     //its like whenever u are seeing someones account for frontend to enable they need to know
                     //whether this user is subscibed to that channel or not to show subscribed symbol gave flag
                     if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                     then: true,
                     else: false
                  }
               }
            }
         },
         {
            $project:{
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
         }
      ]
   )
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

   return res
   .status(200)
   .json(
      new ApiResponse(200,channel[0],"User profile fetched successfully")
   )
})

const getWatchHistory = asyncHandler(async(req,res) =>{
   //get user through req.user from middleware as usual
   //nested pipelines/sub-pipelines one is for linking watchHistory with video
   //other is for video owner to user
   const user = User.aggregate([
      {
         $match :{
            _id:new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline: [
               {
                  $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner",
                     $pipeline:[
                        {
                           $project:{
                              fullName:1,
                              username:1,
                              avatar:1
                           }
                        }
                     ]
                  }
               }
            ]
         }
      },{
         $addFields:{
            owner:{
               $first:"$owner"
            }
         }
      }
   ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export {
   RegisterUser,
   LoginUser,
   LogoutUser,
   generateNewRefreshToken,
   updatePassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   getUserChannelProfile,
   getWatchHistory
};