const jwt = require("jsonwebtoken");
const secret = "super secret";
function createToken(userData) {
  const payload = {
    email: userData.email,
    _id: userData._id,
  };
  const token = jwt.sign(payload, secret, {
    expiresIn: "2h",
  });

  return token;
}

function verifyToken(token) {
  const data = jwt.verify(token, secret);
  return data;
}

module.exports = {
  createToken,
  verifyToken,
};
