const dotenv = require("dotenv");
const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const db = require("./config/db");

dotenv.config({ path: "./config/config.env" });

db();

const app = express();

// Dev Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

const port = process.env.PORT || 5000;

const bootCampRoutes = require("./routes/bootcamp");

//Routes
app.use("/api/v1/bootcamp", bootCampRoutes);

const server = app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} at port ${process.env.PORT}`.cyan
  );
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error : ${err.message}`);
  server.close(() => process.exit(1));
});
