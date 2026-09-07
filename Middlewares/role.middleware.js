
//Create authorization middleware
const authorization = (...allowedRoles) => {
    return (req, res, next) => {
        //Ensure the user object exists from the verifyToken step
        //Check if the user's role is included in the allowed list
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access Denied. You do not have permission to perform this action' //or message: 'Access denied. Your employee role does not have permission to perform this action.'
            });
        }
        //User is authorized! Pass control to the next function
        next();
    };
};

module.exports = { authorization };

// exports.authorize = (...roles) => {
//     return (req, res, next) => {
//         if(!roles.includes(req.user.role)) {
//             return res.status(403).json({ 
//                 success: false, 
//                 message: 'Not authorized to access this route' 
//             });
//         }
//         next();
//     };
// };