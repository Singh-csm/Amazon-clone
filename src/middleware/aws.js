const aws = require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}


let uploadfiles = async (req, res, next) => {
    let files = req.files
    if (req.files && req.files.length > 0) {
        let x = await uploadFile(files[0])
     
        req.profileImage = x
        next()

    } else {
  
        if(Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Body can't be empty..." });
        }
        res.status(400).send({ status: false, message: "please enter Image document." });
    }

}

module.exports = { uploadfiles , uploadFile }