exports.keys = 'bfu';
exports.security = {
  csrf: {
    enable: false,
  },
}
exports.cors = {
  origin: '*',
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  // {string|Function} origin: '*',
  // {string|Array} allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
};
