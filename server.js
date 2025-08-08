const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'photography-site-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Sample data
const portfolioImages = [
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
];

const users = {
  client1: {
    password: 'password',
    photos: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
    ],
  },
  photographer: {
    password: 'photopass',
  },
};

const messages = [];

function ensureClient(req, res, next) {
  if (req.session.user && req.session.user !== 'photographer') {
    next();
  } else {
    res.redirect('/login');
  }
}

function ensurePhotographer(req, res, next) {
  if (req.session.user === 'photographer') {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  res.render('portfolio', { images: portfolioImages, user: req.session.user });
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  messages.push({ name, email, message });
  res.render('contact', { success: true });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username].password === password) {
    req.session.user = username;
    if (username === 'photographer') {
      res.redirect('/admin');
    } else {
      res.redirect('/gallery');
    }
  } else {
    res.render('login', { error: 'Identifiants invalides' });
  }
});

app.get('/gallery', ensureClient, (req, res) => {
  const user = users[req.session.user];
  res.render('gallery', { photos: user.photos, user: req.session.user });
});

app.get('/admin', ensurePhotographer, (req, res) => {
  res.render('admin', { messages, users });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

