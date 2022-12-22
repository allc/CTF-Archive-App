const jwt = require('jsonwebtoken');

module.exports = {
  signJwt(payload) {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: '30d'
    })
  }
}
