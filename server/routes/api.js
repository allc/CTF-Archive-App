var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('../helpers/jwt');
const authMiddleware = require('../middlewares/auth');
const normaliseString = require('../helpers/normaliseString');
const checkUrl = require('../helpers/checkUrl');
const { fetch } = require('node-fetch');

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
  let ctfSlug = req.query.ctf;
  ctfSlug = (ctfSlug) ? ctfSlug : undefined;
  let challengeSlug = req.query.challenge;
  challengeSlug = (challengeSlug) ? challengeSlug : undefined;
  const challenges = await prisma.challenge.findMany({
    where: {
      ctf: {
        slug: ctfSlug,
      },
      slug: challengeSlug,
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
    // check if challenge exists in the ctf
    // not atomic with creation of the challenge
    // just for more informative error message
    // model "unique" ensures data integrity
    const exists = Boolean(await prisma.challenge.findFirst({
      where: {
        slug: challengeData.slug,
        ctf: {
          slug: req.body['ctf_slug']
        }
      }
    }));
    if (exists) {
      res.status(400).json({message: 'Challenge exists for this CTF.'});
      return;
    }
    // challenge data continue
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

router.get('/challenges/:id', async function(req, res) {
  const id = parseInt(req.params.id);
  const challenge = await prisma.challenge.findUnique({
    where: {
      id: id,
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
      description: true,
      flag: true,
      tags: {
        select: {
          name: true,
          slug: true,
        }
      }
    }
  });
  res.json(challenge);
});

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
  const code = req.body['code'];
  const tokenRes = await fetch(process.env.DISCORD_API_ENDPOINT + '/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }).toString(),
  });
  if (!tokenRes.ok) {
    res.status(400).json({message: 'Could not authenticate.'});
    return;
  }
  tokenRes.json().then(
    (json) => {
      fetch(process.env.DISCORD_API_ENDPOINT + '/users/@me', {
        headers: {
          'Authorization': 'Bearer ' + json['access_token'],
        },
      }).then((r) => r.json())
        .then(async function (json) {
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
            token: jwt.sign({ user_id: user.id }),
            username: user.username,
            access_level: user['access_level'],
          });
        }
      );
    }
  );
});

router.get('/auth/user', authMiddleware.requireAuthorized, async function(req, res) {
  const user = req.user;
  res.json({
    username: user['username'],
    access_level: user['access_level'],
  });
});

module.exports = router;
