
import User from '../models/User.js';
import Post from '../models/Post.js';
import sendMail from '../middlewares/sendEmail.js';

// register user
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, msg: 'User already exists' });
        }
        user = await User.create({ name, email, password });

        //
        const token = user.generateAuthToken();
        res.status(201).cookie('token', token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,

        }).json({ success: true, msg: `User created & ${user.name} logged in`, token, user });

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });

    }

}

// getting logged in
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, msg: 'User Email not found' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: 'Invalid credentials' });
        }
        //
        const token = user.generateAuthToken();
        res.status(200).cookie('token', token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,

        }).json({ success: true, msg: `${user.name} logged in`, token, user, });

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
}

// logging out
const logout = async (req, res) => {
    try {
        res.status(200).clearCookie('token').json({ success: true, msg: 'Logged out' });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
}

const followUsers = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.decoded._id);
        if (!userToFollow) {
            return res.status(404).json({ success: false, msg: 'User not found' })
        } else
            if (loggedInUser.following.includes(userToFollow._id)) {
                const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
                loggedInUser.following.splice(indexFollowing, 1);
                await loggedInUser.save();

                const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);
                userToFollow.followers.splice(indexFollowers, 1);
                await userToFollow.save();

                res.status(200).json({ success: true, msg: 'Unfollowed' });
            }
            else {
                loggedInUser.following.push(userToFollow._id);
                await loggedInUser.save();

                userToFollow.followers.push(loggedInUser._id);
                await userToFollow.save();

                return res.status(500).json({ success: true, msg: 'user followed' })
            }

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }

}


// update password
const updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        if
            (!password || !newPassword) {
            return res.status(400).json({ success: false, msg: 'Please enter all fields' });
        }
        const user = await User.findById(req.decoded._id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: 'Invalid credentials' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ success: true, msg: 'Password updated' });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}
// update profile
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.decoded._id)
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        user.name = name;
        user.email = email;
        await user.save();
        res.status(200).json({ success: true, msg: 'Profile updated' });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}

// delete User profile
const deleteMyAccount = async (req, res) => {
    try {
        const user = await User.findById(req.decoded._id);
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        const posts = await Post.find({ user: user._id });
        posts.forEach(async post => {
            await post.remove();
        });
        // removing followers 
        const followers = await User.find({ followers: user._id });
        followers.forEach(async follower => {
            const index = follower.following.indexOf(user._id);
            follower.following.splice(index, 1);
            await follower.save();
        });
        // removing following
        const following = await User.find({ following: user._id });
        following.forEach(async follow => {
            const index = follow.followers.indexOf(user._id);
            follow.followers.splice(index, 1);
            await follow.save();
        });
        await user.remove();

        res.status(200).clearCookie('token').json({ success: true, msg: 'Logged out' });
        res.status(200).json({ success: true, msg: 'Account deleted' });


    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}
// getting logged in user profile
const profile = async (req, res) => {
    try {

        const user = await User.findById(req.decoded._id).select('-password').populate("posts");

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {

        return res.status(500).json({ success: false, msg: error.message });
    }
}

// get any user profile details
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {

        return res.status(500).json({ success: false, msg: error.message });
    }
}
// forget password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, msg: 'Please enter your email' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
        const token = user.generateResetToken();
        await user.save();
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${token}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        try {
            const Options = {
                from: '"social@app"',
                to: email,
                subject: 'Reset your password',
                text: message
            };
            await transporter.sendMail(Options);
            res.status(200).json({ success: true, msg: `Email sent to ${email}` });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, msg: error.message });

        }

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}

// get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        if (!users) {
            return res.status(404).json({ success: false, msg: 'Users not found' });
        }
        res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}

const getMyPosts = async (req, res) => {
   
    try {

        const userId = req.decoded._id;  
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
     
        const posts = [];
        for (let i = 0; i < user.posts.length; i++) {
            const post = await Post.findById(user.posts[i]);
            posts.push(post);
        }
        
          
       
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, msg: error });
    }  
};





export { register, login, logout, followUsers, updatePassword, updateProfile, deleteMyAccount, profile, getProfile, forgotPassword, getAllUsers, getMyPosts };



