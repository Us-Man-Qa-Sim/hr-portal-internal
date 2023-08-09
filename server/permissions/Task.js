const { roles } = require("../configs/Constants");

module.exports.scopedTaskLogs = (user, logs) => {
  if (user.role === roles.ADMIN) return logs;

  if (user.role === roles.EMPLOYEE) return logs;
};
