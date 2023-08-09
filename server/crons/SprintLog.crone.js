var cron = require("node-cron");
const Models = require("../models");
const Helpers = require("../utils/Helpers");
const { StatusIds } = require("../configs/Constants");
const { Op } = require("sequelize");

module.exports.SprintLog = cron.schedule("50 23 * * 5", async () => {
  //module.exports.AttendanceReminder = cron.schedule("*/10 * * * * * ", async () => {
  try {
    let sprint = await Helpers.getCurrentSprintNumber()
    let nextSprint = await Models.Sprint.findOne({
      where: { sprint: parseInt(sprint.sprint) + 1 },
    });

    let totalTasks = await Models.Task.findAll({
      where: { sprintId: sprint?.id, deleted: false },
    });

    totalTasks = Helpers.convertToPlainJSObject(totalTasks)
    console.log(totalTasks.length);
    let shiftedTasks = []
    let tasksLog = totalTasks.map((task) => {
      const { id, projectId, sprintId, statusId } = task;

      let newTaskLog = {
        taskId: id,
        projectId,
        userId: task.employeeId,
        sprintId,
        statusId
      };
      if (StatusIds.Pending === statusId || StatusIds.Progress === statusId) shiftedTasks.push(
        { ...newTaskLog, shifted: true, shiftedSprint: sprint.id, sprintId: nextSprint.id })
      return newTaskLog
    });


    await Models.TaskLog.bulkCreate(tasksLog);
    shiftedTasks.length > 0 && await Models.TaskLog.bulkCreate(shiftedTasks);

    // for (i in shiftedTasks) {

    //   await Models.Task.update(
    //     {
    //       sprintId: nextSprint.id
    //     },
    //     {
    //       where: { id: shiftedTasks[i].taskId },
    //     }
    //   );
    // }

    shiftedTasks.forEach(async (task) => {

      await Models.Task.update(
        {
          sprintId: nextSprint.id
        },
        {
          where: { id: task.taskId },
        }
      );
    })


  } catch (error) {
    console.log(error)
  }
});
