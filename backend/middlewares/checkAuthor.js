import { UserTypeModel } from "../models/UserModel.js";
export const checkAuthor=async(req,res,next)=>{
    //console.log(req.params)
    //get author id 
        let authorId=req.body?.author||req.params?.authorId;
        //check the author
        let author=await UserTypeModel.findById(authorId);
        /*if(!author || author.role!=="AUTHOR"){
        //    return res.status(401).json({message:"author not found"});
        }*/
        //if author is found
        if(!author){
            return res.status(401).json({message:"author not found"});
        }
        //if author is found but role is different
        if(author.role!=="AUTHOR"){
            return res.status(403).json({message:"userr is not an author"});
        }
        //if author is blocked
        if(!author.isActive){
            return res.status(403).json({message:"author is not active"});
        }
        //forward the request to next middleware or route handler
        next();
    }
