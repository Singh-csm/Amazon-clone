const { isValidObjectId } = require("mongoose");
const productModel = require("../models/productModel");
const { isValidString, isValidProductSize } = require("../validations/validator");
const { uploadFile } = require("../middleware/aws")


let createProduct = async function (req, res) {

    try {

        let data = req.body;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Request body doesn't be Empty!" });
        }

        //if keys were undefined then in case:
        let dataInBody = Object.keys(data);
        let arr = ["title", "description", "price", "currencyId", "currencyFormat", "uploadFile", "isFreeShipping", "style", "availableSizes", "installments", "productImage"];

        for (let i = 0; i < dataInBody.length; i++) {
            const someThing = dataInBody[i];
            if (!arr.includes(someThing)) {
                return res.status(400).send({ status: false, message: `${someThing} is not a valid Property.` });
            }
        }

        let { title, description, price, currencyId, currencyFormat, uploadFile, isFreeShipping, style, availableSizes, installments } = data;

        //validation ...
        if (!title) return res.status(400).send({ status: false, message: "title is mandatory." })
        if (!isValidString(title)) { return res.status(400).send({ status: false, message: "Enter valid title." }) }
        title = title.toLowerCase()


        const Check_Title = await productModel.findOne({ title: title })
        if (Check_Title) { return res.status(404).send({ status: false, message: "title already exists. Please enter unique title." }) }

        if (!description) return res.status(400).send({ status: false, message: "description is mandatory." })
        if (!isValidString(description)) { return res.status(400).send({ status: false, message: "Enter some description.." }) }



        if (!price) return res.status(400).send({ status: false, message: "price is mandatory." })
        let Price = Number(price);
        if (isNaN(Price)) { return res.status(400).send({ status: false, message: "Invalid Price entry, Price should be a number." }) }
        if (Price < 0) { return res.status(400).send({ status: false, message: "Price must be positive Integer." }) }

        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required." })
        if (currencyId != "INR") { return res.status(400).send({ status: false, message: "Invalid currencyId, currencyId should be INR only" }) }

        if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyFormat is mandatory." })
        if (currencyFormat != "₹") { return res.status(400).send({ status: false, message: "Invalid currencyFormat, currencyFormat should be ₹ only." }) }

        if (isFreeShipping) {
            if (!isFreeShipping) return res.status(400).send({ status: false, message: "isFreeShipping is mandatory." })
            if (isFreeShipping != "true" && isFreeShipping != "false") return res.status(400).send({ status: false, message: "isFreeShipping should be Boolean value." })
        }

        if (installments) {
            if (!installments) {
                return res.status(400).send({ status: false, message: "installments is mandatory." });
            }
            let Installments = Number(installments)
            if (isNaN(Installments)) {
                return res.status(400).send({ status: false, message: "Invalid installments entry, installments should be a number." });
            }
            if (Installments < 0) {
                return res.status(400).send({ status: false, message: "installments must be positive Integer." });
            }
        }

        if (style) {
            if (!isValidString(style)) {
                return res.status(400).send({ status: false, message: "Invalid style input,style must be string." });
            }
        }

        let arr1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
        let empArr = [];
        if (availableSizes.length != 0) {//string
            let availableSize = availableSizes.split(",");//array
            availableSize.forEach((x) => {//going in its values
                if (!arr1.includes(x)) {//availablesize=
                    empArr.push(x);//

                }
                //1ST S check [arr1]==1 or [arr1]==0
            })
            if (empArr.length > 0) {
                return res.status(400).send({ status: false, message: "availableSizes can only be S, XS, M, X, L, XXL, XL " })
            }
        }

        data.productImage = req.profileImage;
        // availableSizes = availableSizes.trim()
        data.availableSizes = availableSizes.split(",");
        // data.availableSizes = availableSizes.split(',').map((x) => x.trim())
        let create_Data = await productModel.create(data);

        if (!create_Data) {
            return res.status(400).send({ status: false, message: "Data could not be created." });
        }

        return res.status(201).send({ status: true, message: "Success", data: create_Data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message, type: error.type, name: error.name })
    }

}


const getProducts = async function (req, res) {
    try {
        let data = req.query
        if (Object.keys(data).length == 0) {
            let productdata = await productModel.find({ isDeleted: false })
            return res.status(200).send({ status: true, message: "products details", data: productdata })

        }
        let { name, size, priceGreaterThan, priceLessThan, priceSort } = data;
        let obj = {}
        if (name) {
            name = name.toLowerCase();
            obj["title"] = { $regex: name }

        }

        if (priceGreaterThan) {
            obj["price"] = { $gt: priceGreaterThan }
        }
        if (priceLessThan != undefined) {
            obj["price"] = { $lt: priceLessThan }
        }
        if (priceGreaterThan && priceLessThan) {
            obj["price"] = { $gt: priceGreaterThan, $lt: priceLessThan }
        }
        if (size) {
            size = size.toUpperCase();
            if (!isValidProductSize(size)) return res.status(400).send({ status: false, message: "Please enter valid size" });
            obj["availableSizes"] = { $in: size }
        }
        //doing db call with the obj 
        obj["isDeleted"] = { $eq: false }

        let queryArr = Object.keys(data)
        let referenceArr = ["size", "name", "priceGreaterThan", "priceLessThan", "priceSort"]
        let count = 0;
        queryArr.forEach((x) => {
            console.log(x.includes(referenceArr))
            if (!referenceArr.includes(x)) {
                count++;
            }
        })
        if (count > 0) {
            return res.status(400).send({ status: false, message: "please enter vaild filters to fetch data....." });
        }

        let products = await productModel.find(obj);

        //by doing bd call bring the documents according to filter and then sort
        if (!priceSort) priceSort = 1 // if sort is not given then  am sorting in asc order
        if (priceSort == 1) {
            products.sort((x, y) => x.price - y.price);
        }
        else if (priceSort == -1) {
            products.sort((x, y) => y.price - x.price);
        }
        else {
            return res.status(400).send({ status: false, message: "price sort can be 1 or -1 only" });

        }
        if (products.length == 0) {
            return res.status(404).send({ status: false, message: "no products found" });
        }
        else {
            return res.status(200).send({ status: false, message: "products details", data: products });
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}



const fetchProductsById = async function (req, res) {
    try {
        let productId = req.params.productId;

        if (!productId) {
            return res.status(400).send({ status: false, message: "Product Id is required." });
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Product Id is invalid , please enter a valid ID." });
        }

        const getProductsById = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!getProductsById) {
            return res.status(400).send({ status: false, message: "No user found with this Id or might be deleted." });
        }

        res.status(201).send({ status: false, message: "Success", data: getProductsById });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


const updateProducts = async function (req, res) {
    try {
        let data = req.body;

        let productId = req.params.productId;

        let queryArr = Object.keys(data);
        if (queryArr.length == 0) {
            return res.status(400).send({ status: false, message: "Please enter something to update" });
        }

        let referenceArr = ["title", "description", "price", "isFreeShipping", "currencyFormat", "currencyId", "style", "availableSizes", "installments", "productImage"];
        let count = 0;
        queryArr.forEach((x) => {
            if (!referenceArr.includes(x)) {
                count++;
            }
        });

        if (count > 0) {
            return res.status(400).send({ status: false, message: "please enter vaild filters to fetch data....." });
        }

        let { title, description, price, isFreeShipping, style, productImage, currencyId, currencyFormat, availableSizes, installments } = data;

        //validation ...
        if (title) {
            if (!isValidString(title)) {
                return res.status(400).send({ status: false, message: "Enter valid title." });
            }
            title = title.toLowerCase();
            const Check_Title = await productModel.findOne({ title: title });
            if (Check_Title) {
                return res.status(404).send({ status: false, message: "title already exists. Please enter unique title." });
            }
        }

        if (description) {
            if (!isValidString(description)) {
                return res.status(400).send({ status: false, message: "Enter some description.." });
            }
        }

        if (price) {
            let Price = Number(price);
            if (isNaN(Price)) {
                return res.status(400).send({ status: false, message: "Invalid Price entry, Price should be a number." });
            }
            if (Price < 0) {
                return res.status(400).send({ status: false, message: "Price must be positive Integer." });
            }
        }

        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "Invalid currencyId, currencyId should be INR only" });
            }
        }

        if (currencyFormat) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "Invalid currencyFormat, currencyFormat should be ₹ only." });
            }
        }

        if (isFreeShipping) {
            if (isFreeShipping != "true" && isFreeShipping != "false") {
                return res.status(400).send({ status: false, message: "isFreeShipping should be Boolean value." });
            }
        }

        if (installments) {
            let Installments = Number(installments)
            if (isNaN(Installments)) {
                return res.status(400).send({ status: false, message: "Invalid installments entry, installments should be a number." });
            }
            if (Installments < 0) {
                return res.status(400).send({ status: false, message: "installments must be positive Integer." });
            }
        }

        if (availableSizes) {
            let arr1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let empArr = [];
            if (availableSizes.length > 0) {//string
                let availableSize = availableSizes.split(",");//array
                availableSize.forEach((x) => {//going in its values
                    if ((x == undefined) || (!arr1.includes(x))) {//availablesize=
                        empArr.push(x);//

                    }
                    //1ST S check [arr1]==1 or [arr1]==0 
                })
                if (empArr.length > 0) {
                    return res.status(400).send({ status: false, message: "availableSizes can only be S, XS, M, X, L, XXL, XL " });
                }
            }
            data.availableSizes = availableSizes.split(',');
        }


        let files = req.files;
        if ((files) && (files.length > 0)) {
            let uploadFileURL = await uploadFile(files[0]);
            data.productImage = uploadFileURL;
        }

        let a = [];
        queryArr.forEach((y) => {
            if (data[y] == "") {
                a.push(y);
            }
        })
        if (a.length > 0) {
            return res.status(400).send({ status: false, message: `${a[0]} can't be empty` });
        }

        let updateProduct = await productModel.findOneAndUpdate(
            { isDeleted: false, _id: productId },
            data,
            { new: true }
        );

        if (!updateProduct) {
            return res.status(404).send({ status: false, message: "Product is not found or Already Deleted!" });
        }

        return res.status(200).send({ status: true, message: "Success", data: updateProduct });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



const deleteProductById = async function (req, res) {
    try {
        let productId = req.params.productId;
        if (!productId) {
            return res.status(400).send({ status: false, message: "Product Id is required." });
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Product Id is invalid , please enter a valid ID." });
        }

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!checkProduct) {
            return res.status(404).send({ status: false, message: "Data not found for deletion or it already deleted." });
        }

        const deletedProduct = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { isDeleted: false, deletedAt: Date.now() }
        );


        res.status(200).send({ status: true, message: "Product deleted successfully." });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { createProduct, getProducts, fetchProductsById, updateProducts, deleteProductById };