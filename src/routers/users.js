const express = require('express');
const router = express.Router();
const usersController = require('../app/controllers/UserController');
router.get('/signin', usersController.signIn);
router.get('/signup', usersController.signUp);
router.get('/profile', usersController.profile);
module.exports = router;
