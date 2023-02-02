const express = require('express')
const router = express.Router()
const { registerUser, getUser, updateUsers, login } = require('../controller/userController');
const { uploadfiles } = require("../middleware/aws");
const { isAuthentication } = require("../middleware/commonMiddleware");

router.post("/register", uploadfiles, registerUser);
router.get('/user/:userId/profile', isAuthentication, getUser);
router.post("/login", login);
router.put('/user/:userId/profile', uploadfiles, isAuthentication, updateUsers);

module.exports = router