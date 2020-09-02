const {users} = require("./variables");

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
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};
module.exports = {generateRandomString, userEmailCheck};