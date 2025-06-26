import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth.middleware.js';
import {
    postTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from '../controllers/tweet.controller.js';

const router = Router();

router.use(verifyJwt);

router.route('/post').post(postTweet);
router.route('/user/:userId').get(getUserTweets)
router.route('/:tweetId').patch(updateTweet).delete(deleteTweet)

export default router;