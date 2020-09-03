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
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const userURLs = (user_id) => {
  const filteredURLs = {};
  for (let url in urls) {
    if (user_id === urls[url].userID) {
      filteredURLs[url] = urls[url];
    }
  }
  return filteredURLs;
};

module.exports = {generateRandomString, userEmailCheck};