const {getRandomString, findUserWithEmailInDatabase, emailExists, getUserById, urlsForUser, addNewUser} = require("./helper");
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
  const userID = req.cookies.user_id;
  const urlsForUserDB = urlsForUser(userID, urlDatabase);
  console.log("<<<<",urlsForUserDB);
  const user = getUserById(userID, users); 
  console.log("+++",user);
  if (!userID) {
    res.send(`<h3> Please Login first!</h3><a href="/login">Login Here</a>`);
    // return res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlsForUserDB,
      user: users[userID],
    }
    console.log("222",urlsForUserDB);
    console.log("11111",templateVars);
    return res.render("urls_index", templateVars);
  }
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
  if (req.cookies.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: null,
  };
  console.log(templateVars);
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const user_id = getRandomString(5);
  const email  = req.body.email;
  const password  = req.body.password;
  const user = findUserWithEmailInDatabase(email,users);
  if(user) {
    res.status(400).send("user is already exist. Go to Log in page");
  }
  if (!email || !password || emailExists(email,users)) {
    res.status(400).send('<h2>Sorry, your email or password is invalid.</h2>');
    return users;
  } 
  addNewUser(users, email, password);
  console.log(users);
  res.cookie('user_id', user_id);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if(!req.cookies["user_id"]) {
    return res.redirect(`/login`);
  }
  console.log("req.body",req.body); 
  const longURL = req.body.longURL;
  const shortURL = getRandomString(6);
  urlDatabase[shortURL] = { longURL: longURL, userID: req.cookies["user_id"]};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies.user_id;
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
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  console.log(shortURL); 
  urlDatabase[shortURL].longURL = req.body.newURL;
  console.log(shortURL);
  res.redirect(`/urls`);
  });

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});
app.post("/urls/new", (req, res) => {
  // const templateVars = { user: req.cookies["user_id"]};
  res.redirect(`/login`);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log("url");
  // console.log(req.params);
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    console.log(shortURL);
    const longURL = urlDatabase[shortURL].longURL;
    console.log(longURL);
    res.redirect(longURL);
  }
  else {
    res.send('<h2>This tiny link does not exist.</h2>');
  }
});

app.get("/urls/:shortURL", (req, res) => {  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] , user: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});