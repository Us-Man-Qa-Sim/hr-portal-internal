const dotenv = require("dotenv");
dotenv.config({ path: "./configs.env" });
const { mqttServer } = require("./mqttBroker");

//imports that uses environment variables.
const db = require("./server/configs/Database");
const app = require("./app");
const sockets = require("./socket");

db.authenticate()
  .then(() => {
    console.log(
      `Successfully connected with database ==> ${process.env.DB_NAME}`
    );

    if (process.env.DB_ASYNC) {
      db.sync({
        update: true,
      })
        .then(() => console.log("Database successfully synced"))
        .catch((error) => console.log("💥 Error while syncing", error));
    }
  })
  .catch((error) =>
    console.log("💥 Error while connecting to the database", error)
  );

// add connections here
require("./server/configs/Storage");
require("./server/crons/PunchOut.crone");
require("./server/crons/paySlip.crone");
require("./server/crons/AttendanceReminder.crone");
require("./server/crons/Leave.crone");
require("./server/crons/SprintLog.crone");
// starting the express server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
const brokerPort = normalizePort(process.env.MQTT_BROKER_PORT || "4100");
const mqttBrokerServer = mqttServer.listen(brokerPort, () => {
  console.info(`MQTT broker over WS Support started on port ${brokerPort}`);
});
sockets.init(server);

// error handling of unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    db.close();
    process.exit(1);
  });
});

// error handling of uncaught exception
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  db.close();
  process.exit(1);
});


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}