//create a random string 
const getRandomString = (numOfChars) => {
  let randomCharsStr = '';
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < numOfChars; i++) {
    randomCharsStr += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomCharsStr;
};

const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};

//function to look up if email already exist
const emailExists = (emailAddress,users) => {
  for (const key in users) {
    console.log(key);
    if (emailAddress === users[key].email) {
      return true;
    }
  }
};

const getUserById = (id,users) => {
  const user = users[id];
  console.log("...", user);
  if (user) {
    return user;
  }
  return null;
};

const urlsForUser = (id, urlDatabase) => {
  let userURLdata = {};
  for (let shortURL in urlDatabase) {
    console.log("id",id,"userID",urlDatabase[shortURL].userID);
    if (id === urlDatabase[shortURL].userID) {
      userURLdata[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLdata;
};

const addNewUser = (db, email, password) => {
  const userId = getRandomString(5);
  const newUser = {
    id: userId, 
    email: email, 
    password: password,
  };
  db[userId] = newUser;
  return userId;
};

module.exports = {getRandomString, emailExists, getUserById, urlsForUser, addNewUser, getUserByEmail};