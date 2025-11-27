module.exports = {
  // Generate random strings for dynamic URLs
  randomString: function(context, events, done) {
    const strings = ['invoice-guide', 'tax-invoice', 'commercial-invoice', 'fbr-guide'];
    return strings[Math.floor(Math.random() * strings.length)];
  }
};
