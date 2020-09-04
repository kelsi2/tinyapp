const {assert} = require('chai');
const {userEmailCheck} = require('../helperFunctions.js');

const testUsers = {
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

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = userEmailCheck("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return undefined if a user is not in the database', () => {
    const user = userEmailCheck("kili@example.com", testUsers);
    const expectedOutput = undefined;
    assert.isUndefined(user, expectedOutput);
  });
});