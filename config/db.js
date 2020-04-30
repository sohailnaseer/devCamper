const mongoose = require("mongoose");

const connect = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  });
  console.log(
    `Database Connected At ${conn.connection.host} And Listening At  ${conn.connection.port}`
      .yellow
  );
};

module.exports = connect;
