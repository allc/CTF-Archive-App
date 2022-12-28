const jwt = require('../helpers/jwt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

module.exports.requireAuthorized = async function(req, res, next) {
  const authHeader = req.get('Authentication');
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const decodedJwt = jwt.verify(token);
    const user = await prisma.user.findUnique({
      where: {
        id: decodedJwt['user_id'],
      },
    });
    if (user) {
      req.user = user;
      next();
      return;
    }
  }
  res.status(401).json({message: 'Not authorized.'});
}

module.exports.requireAccessLevel = (accessLevel) => {
  return (req, res, next) => {
    if (req.user.access_level >= accessLevel) {
      next();
      return;
    }
    res.status(401).json({message: 'Permission denied.'});
  }
}
