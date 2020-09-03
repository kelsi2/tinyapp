const {users, urls} = require("./variables");

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

const urlsForUser = (id) => {
  let filteredDatabase = {};
  for (let element in urls) {
    if (id === urls[element].userID) {
      filteredDatabase[element] = urls[element];
    }
  }
  return filteredDatabase;
};

function findUserID(email) {
  let output;
  for (const user in users) {
    if (users[user].email === email) {
      output = users[user].id;
      return output;
    }
  }
}

module.exports = {generateRandomString, userEmailCheck, urlsForUser, findUserID};