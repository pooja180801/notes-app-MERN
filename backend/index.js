require("dotenv").config();

const config=require('./config.json')
const mongoose=require('mongoose');

mongoose.connect(config.connectionString, { 
    serverSelectionTimeoutMS: 30000 
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const User=require("./models/user.model")

const express = require("express");
const cors=require("cors");
const app=express();

const jwt=require('jsonwebtoken');
const {authenticateToken}=require('./utilities')

app.use(express.json());

app.use(
    cors({
        origin:"*",
    })
);

app.get("/",(req,res)=>{
    res.json({data:"hello"});
})

//register
app.post("/register",async(req,res)=>{
    const {fullname,email,password}=req.body;

    if(!fullname){
        return res
        .status(400)
        .json({error:true,message:"Userame is required"})
    }

    if(!email){
        return res
        .status(400)
        .json({error:true,message:"Email is required"})
    }

    if(!password){
        return res
        .status(400)
        .json({error:true,message:"Password is required"})
    }

    const isUser=await User.findOne({email:email})

    if(isUser){
        return res.json({
            error:true,
            message:"User already exists",
        })
    }

    const user=new User({
        fullname,
        email,
        password,
    })

    await user.save();

    const accessToken=jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"36000m"
    })

    return res.json({
        error:false,
        user,
        accessToken,
        message:"Registration Successful",
    })

})

//login
app.post("/login",async(req,res)=>{
    const {email,password}=req.body;

    if(!email){
        return res
        .status(400)
        .json({error:true,message:"Email is required"})
    }

    if(!password){
        return res
        .status(400)
        .json({error:true,message:"Password is required"})
    }

    const userInfo=await User.findOne({email:email})

    if(!userInfo){
        return res.status(400).json({message:"User not found"})
    }

    if(userInfo.email===email && userInfo.password===password){
        const user={user:userInfo}
        const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"36000m"
        })
        return res.json({
            error:false,
            message:"Login Successful",
            email,
            accessToken
        })
    }else{
        return res.status(400).json({
            error:true,
            message:"Invalid Credentials"
        })
    }

})

//add notes
app.post("/add",authenticateToken,async(req,res)=>{
    
})


app.listen(4000);

module.exports=app;
