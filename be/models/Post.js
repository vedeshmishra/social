import mongoose from 'mongoose'; 
export default mongoose.model('Post', new mongoose.Schema({
       title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        trim: true
    },
    image: {
        public_id: String,
        url: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
         
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
           
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
            comment: {
                type: String,
                required: true,
            },
        }
    ],

})
); 





 