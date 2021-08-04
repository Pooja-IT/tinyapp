const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser"); //to make this data readable
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


const getRandomString = (numOfChars) => {
  let randomCharsStr = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < numOfChars; i++) {
    randomCharsStr += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomCharsStr;
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
  
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  console.log('<<<<<<<<<', req.body);
  res.cookie(`username`,req.body.username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
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
  const templateVars = { username: req.cookies["username"]};
  res.redirect(`/urls`, templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id; 
  urlDatabase[shortURL] = req.body.newURL;
  console.log(shortURL);
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
  };
  console.log("abc",templateVars);
  res.render('urls_show', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});