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
      start_date: true,
    },
    orderBy: [
      { start_date: { sort: 'desc', nulls: 'last'} },
    ],
  });
  res.json({ctfs: ctfs});
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
        data[field] = normaliseString.normaliseOrNull(data[field]);
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

router.get('/challenges', async function(req, res) {
  let ctfString = req.query.ctf;
  ctfString = (ctfString) ? ctfString : undefined;
  const challenges = await prisma.challenge.findMany({
    where: {
      ctf: {
        slug: ctfString,
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      ctf: {
        select: {
          name: true,
          slug: true,
        }
      },
      category: {
        select: {
          name: true,
          slug: true,
        }
      },
      tags: {
        select: {
          name: true,
          slug: true,
        }
      },
    }
  });
  res.json({challenges: challenges});
});

router.post('/challenges',
  authMiddleware.requireAuthorized,
  authMiddleware.requireAccessLevel(3),
  async function(req, res) {
    // challenge data
    let challengeData = {
      name: req.body['name'],
      slug: null,
      description: req.body['description'],
      flag: req.body['flag'],
    }
    challengeData.name = normaliseString.normalise(challengeData.name);
    challengeData.slug = normaliseString.slguify(challengeData.name);
    console.log(challengeData.slug);
    if (!challengeData.slug) {
      res.status(400).json({message: 'Invalid name.'});
      return;
    }
    challengeData.description = normaliseString.normaliseOrNull(challengeData.description);
    challengeData.flag = normaliseString.normaliseOrNull(challengeData.flag);
    // category data
    let categoryData = {
      name: req.body['category'],
      slug: null,
    };
    categoryData.name = normaliseString.normalise(categoryData.name);
    categoryData.slug = normaliseString.slguify(categoryData.name);
    if (!categoryData.slug) {
      res.status(400).json({message: 'Invalid category.'});
      return;
    }
    // tags
    let tags = req.body['tags'];
    if (!tags) {
      tags = []
    }
    tags = tags.map((tag) => normaliseString.normalise(tag));
    const tagSlugs = tags.map((tag) => normaliseString.slguify(tag));
    if (tagSlugs.some((tagSlug) => !tagSlug)) {
      res.status(400).json({message: 'Invalid tag.'});
      return;
    }
    const tagsConnectOrCreate = tags.map((tag, i) => {
      return {
        where: {
          slug: tagSlugs[i],
        },
        create: {
          name: tag,
          slug: tagSlugs[i],
        }
      };
    });
    // write to database
    await prisma.challenge.create({
      data: {
        name: challengeData.name,
        slug: challengeData.slug,
        ctf: {
          connect: {
            slug: req.body['ctf_slug']
          }
        },
        category: {
          connectOrCreate: {
            where: {
              slug: categoryData.slug
            },
            create: categoryData,
          }
        },
        description: challengeData.description,
        flag: challengeData.flag,
        tags: {
          connectOrCreate: tagsConnectOrCreate
        },
      }
    });
    res.json({message: 'Success.'});
  }
);

router.get('/categories', async function(req, res) {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
    },
    orderBy: [
      { name: 'asc' },
    ],
  });
  res.json({categories: categories});
});

router.get('/tags', async function(req, res) {
  const tags = await prisma.tag.findMany({
    select: {
      name: true,
    },
    orderBy: [
      { name: 'asc' },
    ],
  });
  res.json({tags: tags});
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
