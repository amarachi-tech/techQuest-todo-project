const md5 = require("md5")
const bcrypt = require("bcryptjs")
const { asyncErrorhandler } = require("../Errorhandler/asyncerrorhandler")
const { User } = require("../model/db")
const jwt = require("jsonwebtoken")
const fs = require("fs")
require("dotenv").config()

/*
{
    username, password, name
}
*/
module.exports.createUser = asyncErrorhandler(async(req,res)=>{
    const {password, ...others} = req.body
    // if(password.length < 6  || password.length > 15) return res.json({message : "password length must be less than 15 and greater than 5", success : false})
    const salt = await bcrypt.genSalt(3)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = {password:hashedPassword, ...others}
    const user = await User.create(newUser);
    // after user has succefully been created now we want to create a token
    // we want create a token to identify this user across our application:
    // jwt create token using sign
    const token = jwt.sign({_id : user._id }, process.env.JWTSECRET)
    res.cookie("authorization", token)
    return res.json ({data: user, message: "new user created"})
})

// module.exports.createUser = asyncErrorhandler(async function(req,res){
//     const {password, ...other} = req.body
//     const hashedPassword = md5(password)
//     const bcryptHashed = 
//     const user = await User.create({...other, password : hashedPassword})
//     return res.json({data : user, success : true})
// })

module.exports.login = asyncErrorhandler(async(req,res)=>{
    const {username, password} = req.body
    const user = await User.findOne({username})
    if(!user) return res.json({data: null, message: "no user found"})
    const check = await bcrypt.compare(password, user.password)
    if(!check) return res.json({data: null, message: "authentication failed"})

    // anything here would run if the password mathc
    const token = jwt.sign({_id : user._id }, process.env.JWTSECRET)
    res.cookie("authorization", token)
    return res.json({message : "succesfully logged in", success : true})
})

module.exports.logout = asyncErrorhandler(async function(_,res){
    res.cookie("authorization", "", {maxAge : 1})
    return res.json({message : "Succesfully logged out", success : true})
})


// module.exports.login = asyncErrorhandler(async function(req,res){
//     const {username, password} = req.body
//     const hashedPassword = md5(password)
//     const user = await User.findOne({username})
//     console.log(user)
//     if(!user) return res.json({data : null, message : "Authentication failed", success : false})
//     if(user.password == hashedPassword){
//         return res.json({data : user , success : true})
//     }
//     return res.json({message : "Authentication failed", success : false, data : null})
// })

//change password

module.exports.changePassword = asyncErrorhandler(async function(req, res){
    if(req.body.password.length < 6) return res.status(401).json({message: "Password most be greater than 6", success: false})
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.updateOne({_id: req.user._id}, {password: hashedPassword})
    return res.status(200).json({message: "successfully Update", success: true})
})