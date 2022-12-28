const jwt = require('jsonwebtoken');

module.exports = {
  sign(payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: '30d'
    })
  },
  verify(token) {
    return jwt.verify(token, process.env.TOKEN_SECRET, {
      algorithms: ['HS256'],
    });
  }
}
