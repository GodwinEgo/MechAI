const express = require("express")
const User = require("../models/User")
const router = express.Router();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


//MAINTAIN A LIST OF BLACKLISTED TOKENS
const blackListedTokens = new Set()

//MIDDLEWARE TO CHECK IF THE TOKEN IS BLACKLISTED
const checkTokenBlackList = (req, res, next) => {
    const token = req.headers.authorization;

    if (blackListedTokens.has(token)) {
        return res.status(401).json({error: "Token has been invalidated, you're unauthorized"})
    }
    next();
}

router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;

        //CHECK FOR EXISTING USERNAME
        const existingUserName = await User.findOne({username})
        if (existingUserName) {
            return res.status(200).json({message: "Username already exists"})
        }

        //HASHING THE PASSWORD
        const HashedPassword = await bcrypt.hash(password, 10)

        const user = new User({username, password: HashedPassword});
        await user.save();
        return res.status(200).json({message: "User Created Successfully"})
    } catch (error) {
        console.error(error);
        return res.status(400).json({error: "Failed to register user: "})
    }
})

router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        //CHECK IF USER EXISTS IN THE DB
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({error: "User Not Found"})
        }

        //CHECK IF PASSWORD MATCH
        const PasswordMatch = await bcrypt.compare(password, user.password);
        if (!PasswordMatch) {
            return res.status(400).json({error: "Invalid Password"})
        }

        //AUTH TOKEN
        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {
            expiresIn: "30m"
        })

        return res.status(200).json({message: "Login Success", token});
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: "Login Failed"})
    }
})

router.post('/logout', (req,res)=>{
   try{
       //GET THE TOKEN FROM THE REQUEST HEADERS
       const token = req.headers.authorization;

       //CHECK IF THE TOKEN EXISTS IN THE BLACKLISTED TOKEN SET
       if(blackListedTokens.has(token)){
           return res.status(401).json({message:"Token has been successfully invalidted"})
       }

       blackListedTokens.add(token)

       return res.status(200).json({message:"Logout Successful"})
   }catch (error){
       console.error(error)
       return res.status(400).json({error:"Logout Failed"})
   }
})

module.exports = router