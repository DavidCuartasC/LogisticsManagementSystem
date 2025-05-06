const express = require('express');
const router = express.Router();
const authRoutes = require('./AuthRoutes');
const usersRoutes = require('./UsersRoutes');
const passwordRoutes = require('./PasswordRoutes');

router.use('/authentication', authRoutes);
router.use('/users', usersRoutes);
router.use('/password', passwordRoutes);

module.exports = router;