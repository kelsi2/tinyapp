const users = require("./users");
const urls = require("./urls");

//creates random 6 character string for shortURL
const generateRandomString = () => {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  const resultLength = 6;

  for (let i = 0; i < resultLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

//validates user by email
const userEmailCheck = (email, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

//loops over urls and returns the ones that belong to user
const urlsForUser = (id, urls) => {
  let filteredDatabase = {};
  for (const element in urls) {
    if (id === urls[element].userID) {
      filteredDatabase[element] = urls[element];
    }
  }
  return filteredDatabase;
};

//retrieve user id from email
const findUserID = (email, users) => {
  let output;
  for (const user in users) {
    if (users[user].email === email) {
      output = users[user].id;
      return output;
    }
  }
};

module.exports = {generateRandomString, userEmailCheck, urlsForUser, findUserID};
