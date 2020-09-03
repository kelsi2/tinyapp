const {users, urlDatabase} = require("./variables");

const generateRandomString = () => {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  const resultLength = 6;

  for (let i = 0; i < resultLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const userEmailCheck = (email) => {
  for (let user in users) {
    user = users[user];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const userURLs = (id) => {
  let filteredURLs = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].user) {
      filteredURLs[url] = urlDatabase[url];
    }
  }
  return filteredURLs;
};

module.exports = {generateRandomString, userEmailCheck, userURLs};