function normalise(s) {
    return s.trim();
}

function slguify(s) {
  return normalise(s).toLowerCase().replace(
    /[\W_]+/g, '-'
  );
}

module.exports = {
  normalise,
  slguify,
};
