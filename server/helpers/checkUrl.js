module.exports = {
  isProtocolAllowed(url, allowedProtocols = ['http:', 'https:']) {
    let urlObj = null;
    try {
      urlObj = new URL(url);
    } catch {
      return false;
    }
    return (allowedProtocols.includes(urlObj.protocol.toLowerCase()));
  },
}
