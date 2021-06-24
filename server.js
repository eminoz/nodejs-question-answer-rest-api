const express = require("express");
const dotenv = require("dotenv"); //dotenv u indirip dahil ettik
const connectDatabase = require("./helpers/database/connectDatabase");
const customErrorHandler = require("./middlewares/errors/customErrorHandler");
const path = require("path");

const router = require("./routers/index");

//Enviroment variables
dotenv.config({
  path: "./config/env/config.env",
});

connectDatabase();
const app = express();
const PORT = process.env.PORT;

//Post olarak gelen json objesini alabilmek için express.json
app.use(express.json());

app.use("/api", router);

//Error handler
app.use(customErrorHandler);

//static files
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`App started on ${PORT} : ${process.env.NODE_ENV}`);
});
