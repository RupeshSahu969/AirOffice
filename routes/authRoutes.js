const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.redirect(`http://localhost:8080?token=${token}`); 
  }
);

// Logout route
router.get('/logout', (req, res) => {
  
  res.clearCookie('token'); 
  res.redirect('http://localhost:8080/login'); 
});

module.exports = router;
