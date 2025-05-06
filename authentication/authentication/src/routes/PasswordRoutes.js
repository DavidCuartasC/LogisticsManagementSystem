const express = require('express');
const router = express.Router();
const {changePassword, resetPassword} = require('../controller/PasswordController');

router.post('/change', changePassword);
router.post('/reset', resetPassword);

module.exports = router;