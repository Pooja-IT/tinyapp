const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser"); //to make this data readable
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// add new user object to the global object
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

const getRandomString = (numOfChars) => {
  let randomCharsStr = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < numOfChars; i++) {
    randomCharsStr += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomCharsStr;
};
const findUserWithEmailInDatabase = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};
const emailExists = (emailAddress) => {
  for (const key in users) {
    console.log(key);
    if (emailAddress === users[key].email) {
      return true;
    }
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const email  = req.body.email;
  const password  = req.body.password;
  const user = findUserWithEmailInDatabase(email,users);
  if (!(user == undefined)) {
    if (password === user.password) {
      res.cookie('user_id', user.id);
      console.log(user.id);
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

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies.user_id,
    email: req.params.email,
  };
  console.log(templateVars);
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const user_id = getRandomString(5);
  const email  = req.body.email;
  const password  = req.body.password;
  if (!email || !password || emailExists(email)) {
    res.status(400).send('<h2>Sorry, your email or password is invalid.</h2>');
    console.log(users);
  } else {
    users[user_id] = {
      id: user_id,
      email: email,
      password: password,
    };
    console.log(users);
    // res.cookie('user_id', user_id);
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body); 
  const longURL = req.body.longURL;
  const shortURL = getRandomString(6);
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  //res.send(getRandomString(6)); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  const templateVars = { user: req.cookies["user_id"]};
  res.redirect(`/urls`, templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; 
  urlDatabase[shortURL] = req.body.newURL;
  console.log(shortURL);
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: req.cookies["user_id"]
  };
  console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , user: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});