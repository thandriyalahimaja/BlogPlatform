import jwt from 'jsonwebtoken'
import { config } from 'dotenv';
   
config();

export const verifyToken=(req,res,next)=>{
    //read token from req
    let token=req.cookies.token
    console.log("token:",token)
    if(token===undefined){
        return res.status(400).json({message:"unauthorized req plz login"});
    }
    //console.log("token in verify token middleware",token)
    //verify the validity of token
    let decodedToken=jwt.verify(token,process.env.JWT_SECRET);
    req.user=decodedToken;
    
    //forward req to next middleware or route handler
    next();
}

//body parser middleware
