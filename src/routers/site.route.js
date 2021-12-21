const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');

router.get('/', siteController.index);
router.get('/search', siteController.search);
router.get('/home', siteController.home);

module.exports = router;
