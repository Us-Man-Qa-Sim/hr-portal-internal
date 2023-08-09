const Models = require("../models");
const CatchAsync = require("../utils/CatchAsync");

let Moment = require("moment");
let { extendMoment } = require("moment-range");
const moment = extendMoment(Moment);

module.exports.addSprints = CatchAsync(async () => {
  let startDate = moment(`${new Date().getFullYear()}-09-17`).format(
    "YYYY-MM-DD"
  );
  let sprints = [];
  let i = 1;
  while (i <= 15) {
    var new_date = moment(startDate, "YYYY-MM-DD").add(6, "days");

    sprints.push({
      sprint: i,
      startDate: moment(startDate).format("YYYY-MM-DD"),
      endDate: moment(new_date).format("YYYY-MM-DD"),
      year: new Date(`${moment(new_date).format("YYYY-MM-DD")}`).getFullYear(),
    });

    startDate = moment(startDate, "YYYY-MM-DD").add(7, "days");

    i += 1;
  }
  await Models.Sprint.bulkCreate(sprints);
});
