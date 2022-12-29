function normalise(s) {
    return s.trim();
}

function normaliseOrNull(s) {
  s = s.trim();
  return (s) ? s : null;
}

function slguify(s) {
  return normalise(s).toLowerCase().replace(
    /[\W_]+/g, '-'
  );
}

module.exports = {
  normalise,
  normaliseOrNull,
  slguify,
};
