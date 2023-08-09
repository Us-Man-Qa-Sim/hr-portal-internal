var cron = require("node-cron");
const sequelize = require("sequelize");
const Models = require("../models");
const { roleIds, jobStatus } = require("../configs/Constants");
module.exports.crone = cron.schedule("0 0 0 1 * *", async () => {
  let [, [user]] = await Models.User.update(
    { leaves: sequelize.literal("leaves + 2") },
    {
      where: { roleId: roleIds[1], jobStatus: jobStatus.PERMANENT },
      returning: true,
      individualHooks: true,
    }
  );
  console.log("User Leaves are Updated");
});
