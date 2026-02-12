import exp from 'express'
import { authenticate } from '../services/authService.js'
import { UserTypeModel } from '../models/UserModel.js'
import {verifyToken} from '../middlewares/verifyToken.js'
import bcrypt from 'bcryptjs'
export const commonRouter=exp.Router()

//login 
commonRouter.post("/authenticate",async(req,res)=>{
    //authenticate author(public)
    
        //get user credential from req body
        let userCred=req.body;
        //call authenticate service
        let {token,user}=await authenticate(userCred);
        //save token in cookie
        res.cookie("token",token,
            {
                httpOnly:true,
                sameSite:"lax",
                secure:false,
                
            });
        //send response
        res.status(200).json({message:"login success",payload:user});
    })

//logout
commonRouter.get("/logout",async(req,res)=>{
    //logout for user author,and admin
    //clear the cookie named 'token'
    res.clearCookie("token",
    {
        httpOnly:true,//must match original settings
        sameSite:"lax",//must match original settings
        secure:false,//must match original settings
    });
    res.status(200).json({message:"logout success"});
    })

//change password (protected route)
commonRouter.put("/change-password",verifyToken,async(req,res)=>{
    let {currentPassword,newPassword}=req.body;
    //find user from db
    let user=await UserTypeModel.findById(req.user.userId);
    if(!user){
        return res.status(404).json({message:"user not found"});
    }
    //verify current password
    let isMatch=await bcrypt.compare(currentPassword,user.password);
    if(!isMatch){
        return res.status(401).json({message:"current password is incorrect"});
    }
    //hash and save new password
    user.password=await bcrypt.hash(newPassword,10);
    await user.save();
    //send response
    res.status(200).json({message:"password changed successfully"});
})