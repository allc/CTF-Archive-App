var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('../helpers/jwt');
const authMiddleware = require('../middlewares/auth');
const normaliseString = require('../helpers/normaliseString');
const checkUrl = require('../helpers/checkUrl');

const prisma = new PrismaClient()

router.get('/ctfs', async function(req, res) {
  const ctfs = await prisma.ctf.findMany({
    select: {
      name: true,
      slug: true,
    },
    orderBy: [
      { start_date: { sort: 'desc', nulls: 'last'} },
    ],
  });
  res.json({ctfs: ctfs});
});

router.get('/ctfs/:ctf_slug', async function(req, res) {
  let ctf_slug = req.params.ctf_slug;
  const ctf = await prisma.ctf.findUnique({
    where: {
      slug: ctf_slug
    },
    select: {
      name: true,
      slug: true,
      link: true,
      ctftime_link: true,
      start_date: true,
      more_info: true,
    }
  });
  if (ctf) {
    res.json(ctf);
  } else {
    res.status(404).json({message: 'CTF not found.'});
  }
});

router.post('/ctfs',
  authMiddleware.requireAuthorized,
  authMiddleware.requireAccessLevel(3),
  async function(req, res) {
    let data = {
      name: req.body['name'],
      slug: null,
      link: req.body['link'],
      ctftime_link: req.body['ctftime_link'],
      start_date: req.body['start_date'],
      more_info: req.body['more_info'],
    };
    data.name = normaliseString.normalise(data.name);
    data.slug = normaliseString.slguify(data.name);
    if (!data.slug) {
      res.status(400).json({message: 'Invalid name.'});
      return;
    }
    let normaliseLinks = ['link', 'ctftime_link'].map(function(field) {
      return new Promise(function(resolve, reject) {
        data[field] = normaliseString.normalise(data[field]);
        data[field] = (data[field]) ? data[field] : null;
        if (data[field]) {
        if (!checkUrl.isProtocolAllowed(data[field], ['http:', 'https:'])) {
          reject(new Error(`Invalid ${field}`));
        }
      }
      resolve();
      });
    });
    let isNormaliseLinksFullfilled = null;
    await Promise.all(normaliseLinks).then(() => {
      isNormaliseLinksFullfilled = true;
    }).catch((reason) => {
      res.status(400).json({message: `${reason.message}.`});
      isNormaliseLinksFullfilled = false;
    });
    if (!isNormaliseLinksFullfilled) {
      return;
    }
    ['start_date', 'more_info'].forEach(field => {
      data[field] = (data[field]) ? data[field] : null;
    });
    await prisma.ctf.create({
      data: data,
    });
    res.json({message: 'Success.'});
  }
);

router.post('/challenges',
  authMiddleware.requireAuthorized,
  authMiddleware.requireAccessLevel(3),
  async function(req, res) {
    let data = {
      name: req.body['name'],
      slug: req.body['slug'],
      ctf_id: null,
      category_id: null,
      description: req.body['description'],
    }
  }
);

router.get('/categories', async function(req, res) {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
    },
    orderBy: [
      { name: 'desc' },
    ],
  });
  res.json({categories: categories});
});

router.post('/auth/discord', async function(req, res) {
  const discord_token = req.body['token'];
  fetch(process.env.DISCORD_API_ENDPOINT + '/users/@me', {
    headers: {
      'Authorization': 'Bearer ' + discord_token,
    },
  }).then((r) => r.json())
    .then(async function(json) {
      const discord_user = await prisma.DiscordUser.findUnique({
        where: {
          discord_id: json['id'],
        },
        include: {
          user: true,
        }
      });
      let user = null;
      if (discord_user) {
        user = discord_user.user;
      } else {
        user = await prisma.user.create({
          data: {
            username: json['username'],
            discord_user: {
              create: {
                discord_id: json['id'],
                username: json['username'],
                discriminator: json['discriminator'],
                avatar: json['avatar'],
              }
            },
          }
        })
      }
      res.json({
        token: jwt.sign({user_id: user.id}),
        username: user.username,
        access_level: user['access_level'],
      });
    });
});

router.get('/auth/user', authMiddleware.requireAuthorized, async function(req, res) {
  const user = req.user;
  res.json({
    username: user['username'],
    access_level: user['access_level'],
  });
});

module.exports = router;
