const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config({ path: './config/config.env' });

const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

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

const importData = async () => {
  await connect();
  const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`)
  );
  const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`)
  );
  const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`));
  const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`)
  );

  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);

    await console.log('Data imported successfully :)'.green.inverse);
  } catch (error) {
    console.log('Some error occurred :('.red);
  }
};

const deleteData = async () => {
  await connect();
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data deleted successfully :)'.green.inverse);
  } catch (error) {
    console.log('Some error occurred :('.red);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
