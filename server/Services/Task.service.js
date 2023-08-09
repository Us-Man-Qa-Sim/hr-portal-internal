const Models = require("../models");
const {
  StatusIds,
  StatusTitle,
  ClientBoardStatusIds,
  ClientBoardStatusTitle,
} = require("../configs/Constants");

module.exports.calculateProgress = async (projectId) => {
  // let todayDate = new Date();

  // let sprint = await Models.Sprint.findOne({
  //   where: {
  //     startDate: {
  //       [Op.lte]: todayDate,
  //     },
  //     endDate: {
  //       [Op.gte]: todayDate,
  //     },
  //   },
  // });

  let totalTasks = await Models.Task.findAll({
    where: { projectId, deleted: false },
  });

  let totalTask = await Models.Task.count({
    where: { projectId, deleted: false },
  });

  let taskWeight = 100 / totalTask;

  let taskCalculatedWeight = [];

  taskCalculatedWeight = totalTasks.map((task) => {
    if (
      task.statusId === StatusIds.Cancel ||
      task.statusId === StatusIds.Pending
    )
      return 0;

    if (task.statusId === StatusIds.Progress) {
      let progress = 20 / 100;
      progress = progress * taskWeight;
      return progress;
    }

    if (task.statusId === StatusIds.Testing) {
      let testing = 70 / 100;
      testing = testing * taskWeight;
      return testing;
    }

    if (task.statusId === StatusIds.Complete) {
      return taskWeight;
    }
  });

  let progress = 0;

  for (let i = 0; i < taskCalculatedWeight.length; i++) {
    progress += taskCalculatedWeight[i];
  }
  progress = Math.round(progress);

  await Models.Project.update(
    { progress },
    { where: { id: projectId }, returning: true }
  );

  return;
};

module.exports.calculateSprintProgress = async (projectId, sprintId) => {
  let totalTasks = await Models.Task.findAll({
    where: { projectId, sprintId, deleted: false },
  });

  let totalTask = await Models.Task.count({
    where: { projectId, sprintId, deleted: false },
  });

  let taskWeight = 100 / totalTask;

  let taskCalculatedWeight = [];

  taskCalculatedWeight = totalTasks.map((task) => {
    if (
      task.statusId === StatusIds.Cancel ||
      task.statusId === StatusIds.Pending
    )
      return 0;

    if (task.statusId === StatusIds.Progress) {
      let progress = 20 / 100;
      progress = progress * taskWeight;
      return progress;
    }

    if (task.statusId === StatusIds.Testing) {
      let testing = 70 / 100;
      testing = testing * taskWeight;
      return testing;
    }

    if (task.statusId === StatusIds.Complete) {
      return taskWeight;
    }
  });

  let progress = 0;

  for (let i = 0; i < taskCalculatedWeight.length; i++) {
    progress += taskCalculatedWeight[i];
  }
  progress = Math.round(progress);

  return progress;
};

module.exports.getKanBanTasks = (tasks) => {
  let data = {};

  data[`${StatusIds.Pending}`] = {
    name: StatusTitle.pending,
    items: tasks.filter((task) => task.statusId === StatusIds.Pending),
  };
  data[`${StatusIds.Progress}`] = {
    name: StatusTitle.progress,
    items: tasks.filter((task) => task.statusId === StatusIds.Progress),
  };
  data[`${StatusIds.Testing}`] = {
    name: StatusTitle.Test,
    items: tasks.filter((task) => task.statusId === StatusIds.Testing),
  };
  data[`${StatusIds.Complete}`] = {
    name: StatusTitle.Complete,
    items: tasks.filter((task) => task.statusId === StatusIds.Complete),
  };
  data[`${StatusIds.Cancel}`] = {
    name: StatusTitle.Cancel,
    items: tasks.filter((task) => task.statusId === StatusIds.Cancel),
  };

  return data;
};

module.exports.getClientKanBanTasks = (tasks) => {
  let data = {};

  data[`${ClientBoardStatusIds.ProjectScope}`] = {
    name: ClientBoardStatusTitle.ProjectScope,
    items: tasks.filter(
      (task) => task.statusId === ClientBoardStatusIds.ProjectScope
    ),
  };
  data[`${ClientBoardStatusIds.Progress}`] = {
    name: ClientBoardStatusTitle.Progress,
    items: tasks.filter(
      (task) => task.statusId === ClientBoardStatusIds.Progress
    ),
  };
  data[`${ClientBoardStatusIds.Complete}`] = {
    name: ClientBoardStatusTitle.Complete,
    items: tasks.filter(
      (task) => task.statusId === ClientBoardStatusIds.Complete
    ),
  };
  data[`${ClientBoardStatusIds.TeamQuestion}`] = {
    name: ClientBoardStatusTitle.TeamQuestion,
    items: tasks.filter(
      (task) => task.statusId === ClientBoardStatusIds.TeamQuestion
    ),
  };
  data[`${ClientBoardStatusIds.ClientQuestion}`] = {
    name: ClientBoardStatusTitle.ClientQuestion,
    items: tasks.filter(
      (task) => task.statusId === ClientBoardStatusIds.ClientQuestion
    ),
  };

  return data;
};
