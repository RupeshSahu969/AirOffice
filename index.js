require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./model/User');
const path = require('path');
const userRoutes = require('./routes/userRoute');
const commentRoutes = require('./routes/commentRoute');
const authRoutes = require('./routes/authRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:8080', // Replace with your frontend URL
}));

app.use(express.json());
app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.use(bodyParser.json());
app.use(session({
  secret: process.env.JWT_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Passport Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback", // Ensure this matches your frontend
},
function(accessToken, refreshToken, profile, cb) {
  User.findOneAndUpdate({ googleId: profile.id }, {
    googleId: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    photo: profile._json.picture
  }, { upsert: true, new: true })
    .then(user => cb(null, user))
    .catch(err => cb(err));
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user));
});

// Routes
app.use('/', userRoutes);
app.use('/api', commentRoutes);
app.use('/auth', authRoutes);

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) return res.status(403).send('Forbidden');
      req.user = user;
      next();
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
