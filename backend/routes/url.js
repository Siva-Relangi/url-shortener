import express from 'express';
const router = express.Router();
import { handleGetRequest, handleGenerateShortUrl, handleAnalyticsRequest } from '../Controllers/url.js';

router.route('/').get(handleGetRequest).post(handleGenerateShortUrl);
router.get('/analytics/:shortId', handleAnalyticsRequest);

export default router;