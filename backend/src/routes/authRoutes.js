const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup',  authController.signup);
router.post('/login',   authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout',  authController.logout);
router.get('/me',       authenticate, authController.me);

module.exports = router;
