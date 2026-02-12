import exp from 'express'
import {register} from '../services/authService.js'
//import {authenticate} from '../services/authService.js'
import {config} from 'dotenv'
config();
export const userRoute=exp.Router()

//register user
userRoute.post("/users",async(req,res)=>{
    //get user obj from req bpdy
    let userObj=req.body;
    //call register service
    const newUserObj=await register({... userObj,role:"USER"});
    //send response
    res.status(201).json({message:"user created",payload:newUserObj});
})
/*authenticate user 
userRoute.post("/authenticate",async(req,res)=>{
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
    res.status(200).json({message:"user login success",payload:user});
})*/
//read all the articles(protected route)
userRoute.get("/articles",async(req,res)=>{
    //read all active articles from db
    let articles=await articleTypeModel.find({isActive:true}).populate("author","firstName email");
    //send response
    res.status(200).json({message:"all active articles",payload:articles});

})

//add comment to an article(protected route)
userRoute.post("/articles/:articleId/comments",async(req,res)=>{
    //get article id from req params
    let articleId=req.params.articleId;
    //get comment from req body
    let {comment}=req.body;
    //find article from db
    let article=await articleTypeModel.findById(articleId);
    if(!article || !article.isActive){
        return res.status(404).json({message:"article not found"});
    }
    //add comment to article document
    article.comments.push({comment,user:req.user.userId});
    //save article document
    await article.save();
    //send response
    res.status(201).json({message:"comment added to article"});
})