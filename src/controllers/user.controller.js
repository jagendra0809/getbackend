//import req from "express/lib/request";
import { asyncHandler } from "../utils/asyncHandler.js";
import{ApiError} from "../utils/ApiError.js";
import{ User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"


const registereUser = asyncHandler( async (req,res) => {

    const{fullName, email, username, password } = req.body
    console.log("email:", email);

    if([fullName, email, username, password].some((field)=> field?.trim()=== ""))
        
        {
        throw new ApiError(400,"all required")
    }

    const existedUser = User.findOne({ $or:[{username}, {email}]
    })

        if (existedUser) {
            throw new ApiError(409, "username or email already exists")
        }

       const avatarLocalPath = req.files?.avatar[0]?.path;
       const coverImagePath = req.files?.coverImage[0]?.path;
       
       if(!avatarLocalPath )
       { throw new ApiError(400,"missing avatar")}


       const avatar = await uploadOnCloudinary(avatarLocalPath) 
       const coverImage = await uploadOnCloudinary(coverImagePath)

       if (!avatar) {
        throw new ApiError(400, "avatar is requied")
       }

      const user =await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
              
       })

       const createdUser = await User.findById(user.id).select("-password -refreshToken")

       if (!createdUser) {
        throw new ApiError(500, "Failed while registering user")
       }


       return res.status(201).json(
        new ApiResponse(200, createdUser, "User registration successful")
       )

    })

export { registereUser }


