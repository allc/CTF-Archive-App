var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client')
const { marked } = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const prisma = new PrismaClient()

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/ctfs');
});

router.get('/ctfs', async function(req, res) {
  const ctfs = await prisma.ctf.findMany();
  res.render("ctfs", {ctfs: ctfs});
});

router.get('/ctf/:ctf_slug', async function(req, res) {
  let ctf_slug = req.params.ctf_slug;
  const ctf = await prisma.ctf.findUnique({
    where: {
      slug: ctf_slug
    }
  });
  if (ctf.more_info) {
    more_info = marked.parse(ctf.more_info);
    const DOMPurify = createDOMPurify(new JSDOM('').window);
    ctf.more_info = DOMPurify.sanitize(more_info);
  }
  if (ctf) {
    res.render("ctf", {ctf: ctf});
  } else {
    res.status(404).send("Page not found");
  }
});

module.exports = router;
