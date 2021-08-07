const { getRandomString, emailExists, getUserById, urlsForUser, addNewUser, getUserByEmail } = require('./helper.js');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser"); //to make this data readable
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"],
}));
const bcrypt = require('bcryptjs');

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

//homepage
app.get("/", (req, res) => {
  if (!req.session.user_id) return res.redirect(`/login`);
  else {
    return res.redirect(`/urls`);
  }
});

//showing database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Main page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urlsForUserDB = urlsForUser(userID, urlDatabase);
  const user = getUserById(userID, users); 
  if (!userID) {
    res.send(`<h3> Please Login first!</h3><a href="/login">Login Here</a>`);
  } else {
    const templateVars = {
      urls: urlsForUserDB,
      user: req.session["user_id"],
    }
    return res.render("urls_index", templateVars);
  }
});

//login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const email  = req.body.email;
  const password  = req.body.password;
  const user = getUserByEmail(email,users);
  const hashedPassword = user.password;
  if (!(user == undefined)) {
    if (bcrypt.compareSync(password, hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h2>403 Forbidden<br>You entered the wrong password.</h2>')
    }
  } else {
    res.statusCode = 403;
    res.send('<h2>403 Forbidden<br>This email address is not registered.</h2>')
  }
});

//logout page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const user_id = getRandomString(5);
  const email  = req.body.email;
  const password  = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  const user = getUserByEmail(email,users);
  if(user) {
    res.status(400).send("user is already exist. Go to Log in page");
  }
  if (!email || !password || emailExists(email,users)) {
    res.status(400).send("Sorry, your email or password is invalid.");
    return users;
  } else {

  }
  addNewUser(users, email, hashedPassword);
  req.session.user_id = user_id;
  res.redirect("/urls");
});

//new
app.post("/urls", (req, res) => {
  if(!req.session["user_id"]) {
    return res.redirect(`/login`);
  }
  const longURL = req.body.longURL;
  const shortURL = getRandomString(6);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.session["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send('⚠️ inaccessible ⚠️');
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    const urlToDelete = req.params.shortURL;
  if (userURLs[urlToDelete]) {
    delete urlDatabase[urlToDelete];
    res.redirect('/urls');
  } else {
      return res.status(400).send('⚠️ inaccessible ⚠️');
    }
  }
});

// Edit
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect(`/urls`);
  });

// Create URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.session["user_id"]};
  res.render("urls_new", templateVars);
});
app.post("/urls/new", (req, res) => {
  res.redirect(`/login`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
      res.send('<h2>This tiny link does not exist.</h2>');
    }
});

// Show URL page
app.get("/urls/:shortURL", (req, res) => {  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] , user: req.session["user_id"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});