const express=require('express')
const router=express.Router()
const {registerUser , getUser , updateUser , login}=require('../controller/userController')

router.post("/register" , registerUser);
router.get('/user/:userId/profile', getUser);
router.post("/login",login);
router.put('/user/:userId/profile',updateUser);

module.exports=router