import express from 'express';
 const router = express.Router();
import {register,login,logout, followUsers, updatePassword, updateProfile, deleteMyAccount, profile, getProfile,forgotPassword, getAllUsers, getMyPosts} from '../controllers/user.js';
import { isAuthenticated } from '../middlewares/auth.js';
router.route("/register").post(register);
router.route("/login").post(login);

router.route('/follow/:id').get(isAuthenticated, followUsers);
router.route("/logout").get(logout);


router.route("/c-password").put(isAuthenticated, updatePassword);
router.route("/update-profile").put(isAuthenticated, updateProfile);

router.route("/delete-account").delete(isAuthenticated, deleteMyAccount);
router.route("/profile").get(isAuthenticated, profile);
router.route("/profile/:id").get(isAuthenticated, getProfile);
router.route("/forgot-password").post(forgotPassword);
router.route("/all-users").get(isAuthenticated, getAllUsers);

router.route("/my/posts").get(isAuthenticated, getMyPosts);
 export default router;

