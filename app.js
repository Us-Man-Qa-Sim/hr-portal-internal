const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./server/route");
const AppError = require("./server/utils/AppError");
const ErrorHandler = require("./server/controllers/Error.controller");

// use packages in order and middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.text({ limit: "50mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
  // parameterLimit: 100000
}))
// app.use(express.multipart({ limit: "50mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

// only work in dev environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// routes
app.use(process.env.SERVER_ADDRESS, router);

//error Handlers

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(ErrorHandler);

module.exports = app;
