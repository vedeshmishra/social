import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const isAuthenticated = async (req, res, next) => {
    
    const {token} = req.cookies;
 
    if (token) {
        await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
           
          if (err) {
                 
                return res.status(401).json({ success: false, msg: 'Failed to authenticate token.Plz, Login First' });
          } else {
              req.decoded = decoded;
              req.user = User.findById(decoded._id);
              
                next();
            }
        });
    } else {
        return res.status(401).json({ success: false, msg: 'No token provided.' });
    }
}

  