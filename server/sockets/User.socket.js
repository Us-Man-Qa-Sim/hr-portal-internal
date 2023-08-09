module.exports.addConnectedUser = (list, user) => {
  list.push(user);
  return list;
};

module.exports.removeConnectedUser = (list, socketId) => {
  return list.filter((item) => item.socketId !== socketId);
};

module.exports.getSocketIds = (list, userId) => {
  const users = list.filter((item) => item.userId === userId);
  if (users) return users;

  return;
};
