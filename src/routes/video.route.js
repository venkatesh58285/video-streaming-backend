import {Router} from 'express';
import{
    deleteVideo,
    updateVideo,
    getVideoById,
    togglePublishVideo,
    publishAVideo,
    getAllVideos
} 
from '../controllers/video.controller.js';
import {uploads} from '../middlewares/multer.middleware.js'
import {verifyJwt} from '../middlewares/auth.middleware.js'

const router = Router();

router.use(verifyJwt)
router.route('/').get(getAllVideos);
router.route('/video-post').post(
    uploads.fields([
        {name:'videoFile',maxCount:1},
        {name:'thumbnail' ,maxCount:1}
    ]),
    publishAVideo
)
router.route('/video/:videoId').delete(deleteVideo).patch(uploads.single('thumbnail'),updateVideo).get(getVideoById);
router.route('/video/toggle/:videoId').patch(togglePublishVideo)

export default router;