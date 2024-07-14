require("dotenv").config();

const config=require('./config.json')
const mongoose=require('mongoose');

mongoose.connect(config.connectionString, { 
    serverSelectionTimeoutMS: 30000 
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const User=require("./models/user.model")
const Note=require("./models/note.model")

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
    const {username,email,password}=req.body;

    if(!username){
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
        username,
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

//get user
app.get("/get-user",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const isUser=await User.findOne({_id:user._id});

    if(!isUser){
        return res.sendStatus(401)
    }

    return res.json({
        user:{username:isUser.username,email:isUser.email,_id:isUser._id,createdOn:isUser.createdOn},
        message:""
    })
})

//add notes
app.post("/add",authenticateToken,async(req,res)=>{
    const{title,content,tags}=req.body;
    const{user}=req.user;

    if(!title){
        return res
        .status(400)
        .json({error:true,message:"Title is required"})
    }

    if(!content){
        return res
        .status(400)
        .json({error:true,message:"Content is required"})
    }

    try{
        const note=new Note({
            title,content,
            tags:tags || [],
            userId:user._id
        })

        await note.save()

        return res.json({
            error:false,
            note,
            message:"Note added successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }

})

//edit notes
app.put("/edit/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {title,content,tags,isPinned}=req.body;
    const {user}=req.user;

    if(!title && !content && !tags){
        return res
        .status(400)
        .json({error:true,message:"No changes provided"})
    }

    try {
        console.log(noteId)
        const note=await Note.findOne({_id:noteId,userId:user._id})

        if(!note){
            return res
            .status(404)
            .json({error:true,message:"Note not found"})
        }

        if(title)
            note.title=title;
        if(content)
            note.content=content;
        if(tags)
            note.tags=tags;
        if(isPinned)
            note.isPinned=isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note updated successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500)
        .json({error:true,message:"Internal server error"})
    }
})

//view all
app.get("/viewAll",authenticateToken,async(req,res)=>{
    const{user}=req.user;

    try {
        const notes=await Note.find({userId:user._id}).sort({isPinned:-1});

        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }

})

//delete note
app.delete("/delete/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {user}=req.user;

    try {
        const note=await Note.findOne({_id:noteId,userId:user._id})

        if(!note){
            return res.status(404).json({
                error:true,
                message:"Note not found"
            })
        }

        await Note.deleteOne({_id:noteId,userId:user._id})

        return res.json({
            error:false,
            message:"Note deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
})

//update isPinned
app.put("/update-note-pinned/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {isPinned}=req.body;
    const {user}=req.user;

    try {
        console.log(noteId)
        const note=await Note.findOne({_id:noteId,userId:user._id})

        if(!note){
            return res
            .status(404)
            .json({error:true,message:"Note not found"})
        }

        note.isPinned=isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note updated successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500)
        .json({error:true,message:"Internal server error"})
    }

})

//search
app.get("/search",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const {query}=req.query;

    if(!query){
        return res.status(400).json({error:true,message:"Search query is required"})
    }

    try {
        const matchingNotes=await Note.find({
            userId:user._id,
            $or:[
                {title:{$regex:new RegExp(query,"i")}},
                {content:{$regex:new RegExp(query,"i")}},
            ]
        })

        return res.json({
            error:false,
            notes:matchingNotes,
            message:"Notes matching the search query retrieved successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        .json({error:true,message:"Internal server error"})
    }
})

app.listen(4000);

module.exports=app;
