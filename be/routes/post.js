import express from 'express';
 const router = express.Router();
import {createPost, likePost, deletePost, getPostFollowing, updatePost,addComment, deleteComment} from '../controllers/post.js';
import { isAuthenticated } from '../middlewares/auth.js';

router.route("/post/upload").post(isAuthenticated, createPost);
router.route("/post/like/:id").get(isAuthenticated, likePost);
router.route("/post/delete/:id").delete(isAuthenticated, deletePost);

router.route("/post/following").get(isAuthenticated, getPostFollowing);


router.route("/post/update/:id").put(isAuthenticated, updatePost);
router.route("/post/comment/:id").post(isAuthenticated, addComment);
router.route("/post/deletecomment/:id").delete(isAuthenticated, deleteComment);

export default router;

