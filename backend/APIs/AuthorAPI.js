import exp from 'express'
import {register} from '../services/authService.js'
import {config} from 'dotenv'
//import { UserTypeModel } from '../models/UserModel.js';
import { articleTypeModel } from '../models/ArticleModel.js';
import { checkAuthor } from '../middlewares/checkAuthor.js';
import { verifyToken } from '../middlewares/verifyToken.js';
config();
export const authorRoute=exp.Router()

//register author(public)
authorRoute.post("/users",async(req,res)=>{
    //get user obj from req body
    let userObj=req.body;
    //call register service
    const newUserObj=await register({... userObj,role:"AUTHOR"});
    //send response
    res.status(201).json({message:"author created",payload:newUserObj});
})
/*authenticate author(public)

authorRoute.post("/authenticate",async(req,res)=>{
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
    res.status(200).json({message:"alogin success",payload:user});
})*/
//create article (author)(protcted route)
authorRoute.post("/articles",verifyToken,checkAuthor,async(req,res)=>{
    //get article obj from req body
    let article=req.body;
    
    //create article
    let newArticleDoc=new articleTypeModel(article);
    //save article document
    let createdArticleDoc=await newArticleDoc.save();
    //send response
    res.status(201).json({message:"article created",payload:createdArticleDoc});
})
//read articles of author 
authorRoute.get("/articles/:authorId",verifyToken,checkAuthor,async(req,res)=>{
    //get author id 
    let authorId=req.params.authorId;
    //read articles of the author
    let articles=await articleTypeModel.find({author:authorId,isActive:true}).populate("author", "firstName email");;
    //let articles=await articleTypeModel.find({author:authorId,isArticleActive:true}).populate("author","firstName email");
    //send res
    res.status(200).json({message:"author articles",payload:articles});
})

/*read ALL articles of author (protected route)
authorRoute.get("/articles/:authorId",verifyToken,checkAuthor,async(req,res)=>{
    let authorId=req.params.authorId;
    let articles=await articleTypeModel.find({author:authorId});
    res.status(200).json({message:"all author articles",payload:articles});
})*/

//edit article(protected route)
authorRoute.put("/articles",verifyToken,checkAuthor,async(req,res)=>{
    //get modified article from req body
    let {articleId,title,category,content,author}=req.body;
    //find article  from req 
    let articleOfDb=await articleTypeModel.findOne({_id:articleId,author:author});
    //if article not found
    if(!articleOfDb){
        return res.status(401).json({message:"article not found"});
    }
    /*check the article is published by author is received from client
    if(articleOfDb.author.toString()!==req.params.authorId){
        return res.status(403).json({message:"access denied"});
    }*/
    //update the article(protected route)
    let updatedArticle=await articleTypeModel.findByIdAndUpdate(articleId,
        {
            $set:{title,category,content},
        },{new:true,
            runValidators:true
        });
    //save the updated article
    //updatedArticle=await updatedArticle.save();
    //send response
    res.status(200).json({message:"article updated",payload:updatedArticle});
})

//delete(soft delete) article(protected route)
authorRoute.delete("/articles/:articleId",verifyToken,checkAuthor,async(req,res)=>{
    //get article id
    let articleId=req.params.articleId;
    //find article from db
    let articleOfDb=await articleTypeModel.findById(articleId);
    //if article not found
    if(!articleOfDb){
        return res.status(401).json({message:"article not found"});
    }
    //check the article is published by author is received from client
    if(articleOfDb.author.toString()!==req.params.authorId){
        return res.status(403).json({message:"access denied"});
    }
    //soft delete the article
    await articleTypeModel.findByIdAndUpdate(articleId,
        {
            $set:{isActive:false},
        });
    //send response
    res.status(200).json({message:"article deleted"});
})
