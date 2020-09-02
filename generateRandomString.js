function generateRandomString() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  const resultLength = 6;

  for (let i = 0; i < resultLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {generateRandomString};