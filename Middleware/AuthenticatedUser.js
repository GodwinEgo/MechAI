const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()

const AuthenticatedUser = async (req, res, next) => {
    try {
        const AuthorizationHeader = req.headers.authorization;

        if(!AuthorizationHeader){
            return res.status(401).json({error:"You're not allowed to access this page"});
        }

        const token = AuthorizationHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({error:"No token Provided !! You're not allowed to access this page"});
        }
        const decodedToken = jwt.verify(token, process.env.SECRETKEY, {
            expiresIn: "30m"
        })
        req.userData = {userId: decodedToken.userId}
        next()
    } catch (error) {
        console.error(error)
        return res.status(401).json({error:"UNAUTHORIZED !!You're not allowed to access this page"});
    }
}

module.exports = AuthenticatedUser;