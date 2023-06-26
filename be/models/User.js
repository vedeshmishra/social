import mongoose from 'mongoose';
import  bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: [true, 'Email already exists'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user' 
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post' 
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user' 
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user' 
        }
    ],
    avatar: {
        public_id: String,
        url:String 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});

userSchema.pre('save', async function (next) { 
   
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        //console.log('pre save', this.password);
    }
    next();
});

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password); 
};

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET);
    return token;
};
userSchema.methods.generateResetToken = function() {
const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;

}

const User = mongoose.model( 'User', userSchema);
export default User;