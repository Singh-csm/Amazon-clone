const express = require('express');
const router = express.Router();

const { registerUser, getUser, updateUsers, login } = require('../controller/userController');
const { createProduct, getProducts, fetchProductsById, deleteProductById } = require("../controller/productController");
const { uploadfiles } = require("../middleware/aws");
const { isAuthentication } = require("../middleware/commonMiddleware");


//=======APIs for User=========
router.post("/register", uploadfiles, registerUser);
router.get('/user/:userId/profile', isAuthentication, getUser);
router.post("/login", login);
router.put('/user/:userId/profile', isAuthentication, updateUsers);
//======APIs for Product========
router.post("/products", uploadfiles ,createProduct);
router.get("/products", getProducts);
router.get("/products/:productId" , fetchProductsById);
router.delete("/products/:productId" , deleteProductById);


module.exports = router