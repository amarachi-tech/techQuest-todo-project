const express = require("express")
const { getAllUsers , getAUser, getMyProfile} = require("../controllers/usersController")
const { isAuthorized } = require("../middleware/authorization")
const router = express.Router()


router.use(express.json())

router.get("/", getAllUsers)

router.get("/profile", isAuthorized, getMyProfile)

//get a user
router.get("/:id", getAUser)

// router.use(function(err,_,res,___){
//     if(err.name)
//     return res.json({message : "an error occured on the server", success : false})
// })

module.exports = router