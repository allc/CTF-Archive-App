module.exports = {
  isProtocolAllowed(url, allowedProtocols = ['http:', 'https:']) {
    const urlObj = new URL(url);
    return (allowedProtocols.includes(urlObj.protocol.toLowerCase()));
  },
}
