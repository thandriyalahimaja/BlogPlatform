import exp from 'express'
import {connect} from 'mongoose'
import {config} from 'dotenv'
import cookieParser from 'cookie-parser'
import { userRoute } from './APIs/UserAPI.js'
import { authorRoute } from './APIs/AuthorAPI.js'
import { adminRoute } from './APIs/AdminAPI.js'
import { commonRouter } from './APIs/commonApi.js'
//import { verifyToken } from './middlewares/verifyToken.js'

config() //process.env
//create express application
const app=exp()
//add body parser middleware
app.use(exp.json())
//add cookie parser middleware
app.use(cookieParser())
//connect APIs
app.use('/user-api',userRoute)
app.use('/author-api',authorRoute)
app.use('/admin-api',adminRoute)
app.use("/common-api",commonRouter)
//connect to db
const connectDB=async()=>{
    try{
    await connect(process.env.DB_URL)
    console.log("DB connection success")
    //start server
    app.listen(process.env.PORT,()=>console.log("server listening on 3000"))
    }catch(err){
        console.log("DB connection failed",err)
    }
}
connectDB()
/*logout for user author,and admin
app.post("/logout",(req,res)=>{
    //clear the cookie named 'token'
    res.clearCookie("token",
    {
        httpOnly:true,//must match original settings
        sameSite:"lax",//must match original settings
        secure:false,//must match original settings
    });
    res.status(200).json({message:"logout success"});
    })
*/

//dealing with invalid path
app.use((req,res,next)=>{
    console.log(req.url)
    res.json({message:req.url+" is invalid path"})
})
//error handling middleware
app.use((err, req,res,next)=>{
    console.log("err:",err)
    res.json({message:"error",reason:err.message})
})