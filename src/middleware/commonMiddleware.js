const jwt = require("jsonwebtoken");

// const isAuthentication = async function (req, res, next) {
//     try {
//         let token = req.headers.authorization;
//         console.log(token.split(" "));
//         token = token[1];
//         console.log(token);
//         if (!token) {
//             return res.status(400).send({ status: false, message: "Token is required." });
//         }

//         jwt.verify(token, "NKTCGROUPTHREEPROJECTFIVE", function (err, decode) {
//             if (err) {
//                 if (err.name == "JsonWebTokenError") {
//                     return res.status(401).send({ status: false, message: "Invalid Token." });
//                 }

//                 if (err.name == "TokenExpiredError") {
//                     return res.status(401).send({ status: false, message: "You are Logged out , please login again." });
//                 } else {
//                     return res.status(401).send({ status: false, message: err.message });
//                 }
//             } else {
//                 req.decodedToken = decode;
//                 next();
//             }
//         });

//     } catch (error) {
//         // return res.status(500).send({ status: false, messsage: err.messsage });
//         // if (error.message == "invalid token") return res.status(401).send({ status: false, msg: "authentication failed May be your header part failed" }) 
//         // if (error.message.startsWith("Unexpected")) return res.status(401).send({ status: false, msg: "authentication failed May be your payload part failed" }) 
//         // if (error.message == "invalid signature") return res.status(401).send({ status: false, msg: "authentication failed May be your singature part failed" }) 
//         // if (error.message == "jwt expired") return res.status(401).send({ status: false, msg: "authentication failed May be your Token is Expired" }) 

//         return res.status(500).send({ status: false, msg: error.message })
//     }
// }

const isAuthentication = async function (req, res, next) {
    try {
        const bearerHeader = req.header('Authorization')

        if (!bearerHeader) {
            return res.status(400).send({ status: false, msg: "token is required" })
        }

        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        let decodetoken = jwt.verify(token, "NKTCGROUPTHREEPROJECTFIVE")

        req.token = decodetoken.userId
        next()

    }
    catch (error) {

        if (error.message == "invalid token") return res.status(401).send({ status: false, msg: "authentication failed May be your header part currupt" }) // failed ka 401 ?
        if (error.message.startsWith("Unexpected")) return res.status(401).send({ status: false, msg: "authentication failed May be your payload part currupt" }) // failed ka 401 ?
        if (error.message == "invalid signature") return res.status(401).send({ status: false, msg: "authentication failed May be your singature part currupt" }) // failed ka 401 ?
        if (error.message == "jwt expired") return res.status(401).send({ status: false, msg: "authentication failed May be your Token is Expired" }) // failed ka 401 ?

        return res.status(500).send({ status: false, msg: error.message })

    }
}

module.exports = { isAuthentication };