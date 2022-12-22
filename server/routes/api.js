var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { signJwt } = require('../helpers/jwt');

const prisma = new PrismaClient()

router.get('/ctfs', async function(req, res) {
  const ctfs = await prisma.ctf.findMany({
    select: {
      name: true,
      slug: true,
    },
  });
  res.json(ctfs);
});

router.get('/ctf/:ctf_slug', async function(req, res) {
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

router.post('/auth/discord', async function(req, res) {
  const discord_token = req.body['token'];
  console.log(discord_token);
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
        token: signJwt({user_id: user.id}),
        username: user.username,
      });
    });
});

module.exports = router;
