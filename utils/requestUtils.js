exports.getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
};

exports.getUserAgent = (req) => {
  return req.headers['user-agent'] || '';
};
