import Post  from '../models/Post.js';
import User from '../models/User.js';
import cloudinary from 'cloudinary';
const createPost = async (req, res) => {
     try { 
        
        const { caption, title, content } = req.body; 
        const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
             folder: 'posts'
             });
         
        const newPost = await Post.create({
            caption: caption,
            image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
            title: title,
            content: content, // the property is "username" in model
            owner: req.decoded._id,
                }, function (err, post_data) {
                     if (err) {
                        res.status(400).json(err)
                    } else { 
                         
                        User.findById(req.decoded._id,   function (err, data) {
                            if (err) {
                                console.log("Error updating user: ", err);
                                res
                                    .status(400)
                                    .json(err)
                            } else {
                                 
                                data.posts.push(post_data._id);
                                data.save();
                                console.log("User updated: ");
                                res
                                    .status(200)
                                    .json({ success: true, data: newPost , msg: 'Post created successfully' });
                            }
                        }) 

                    } 
            
                }); 
        
          
        
         

    } catch (err) {
        console.error(err);
        res.status(500).json({ success:false, msg: err});
    }
};


const likePost = async (req, res) => {
    try {         
        const  postId  = req.params.id;
        const userId = req.decoded._id;
          
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        if (post.likes.includes(userId)) {
            const index = post.likes.indexOf(userId);
            post.likes.splice(index, 1);
          await  post.save();
            res.status(400).json({ success: true, msg: 'Post Un-liked successfully' });
        } else if (post.likes.indexOf(userId) === -1) {
            post.likes.push(userId);
          await  post.save();
            res.status(200).json({ success: true, msg: 'Post liked successfully' });
        }  
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.decoded._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }   
        if (post.owner.toString() !== userId) {
            return res.status(401).json({ success: false, msg: 'Unauthorized' });
        }
        await Post.findByIdAndRemove(postId);
        await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });

        res.status(200).json({ success: true, msg: 'Post deleted successfully' });
    } catch (err) {
       
        res.status(500).json({ success: false, msg: err });
    }
};

const getPostFollowing = async (req, res) => {
    try { 
        const userId = req.decoded._id;
        const user = await User.findById(userId);
       
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }
      
        const posts = await Post.find({ owner: { $in: user.following } });
           
        res.status(200).json({ success: true,   posts });
    } catch (err) {
         
        res.status(500).json({ success: false, msg: err });
    }
};

const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.decoded._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        if (post.owner.toString() !== userId) {
            return res.status(401).json({ success: false, msg: 'Unauthorized' });
        }
        const { caption, title, content } = req.body;
        post.caption = caption;
        post.title = title;
        post.content = content;
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err });
    }
};
// add comments
const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.decoded._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        let commentIndex = -1;
        post.comments.forEach((comment, index) => {
            if (comment.user.toString() === userId) {
                commentIndex = index;
            }
        });

        if (commentIndex !== -1) {
            posts.comments[commentIndex].comment = req.body.comment;
            await post.save();
            res.status(200).json({ success: true, data: post , msg: 'Comment updated successfully' });

        } else
            {
            post.comments.push({
                comments: req.body.comment
                , user: userId
            });
            await post.save();
            
            res.status(200).json({ success: true, data: post, msg: 'Comment added successfully' });
            }
       
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err });
    }
};

// delete comment
const deleteComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.decoded._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, msg: 'Post not found' });
        }
        if (post.owner.toString() !== userId) {
            return res.status(401).json({ success: false, msg: 'Unauthorized' });
        }
        const { comment } = req.body;
        const index = post.comments.indexOf(comment);
        post.comments.splice(index, 1);
        await post.save();
        res.status(200).json({ success: true, data: post, msg: 'Comment deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: err });
    }
};
 






export { createPost, likePost, deletePost, getPostFollowing,updatePost, addComment,deleteComment};
