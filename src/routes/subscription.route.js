import {Router} from 'express';
import {verifyJwt} from '../middlewares/auth.middleware.js';
import {
     SubscribeToChannel,
    UnSubscribeToChannel,
    getChannelSubscribers,
    getChannelsSubscribedTo
} from '../controllers/subscription.controller.js';
const router = Router();

router.use(verifyJwt);

router.route('/subscribe/:channelId').post(SubscribeToChannel);
router.route('/unsubscribe/:channelId').post(UnSubscribeToChannel);
router.route('/channel-subscribers').get(getChannelSubscribers);
router.route('/channels-subscribed-to').get(getChannelsSubscribedTo);

export default router;