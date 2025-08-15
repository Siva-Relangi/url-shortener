import express from 'express';
import { handleGetRequest, handleGenerateShortUrl, handleAnalyticsRequest, handleDeleteRequest } from '../controllers/url.js';

const router = express.Router();
router.route('/').get(handleGetRequest).post(handleGenerateShortUrl);
router.get('/analytics/:shortId', handleAnalyticsRequest);
router.delete('/:shortId', handleDeleteRequest);

export default router;