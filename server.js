const expressFileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const errorHandler = require('./middlewares/error');

const xss = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

dotenv.config({ path: './config/config.env' });

db();

const app = express();

// Dev Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

app.use(express.json());
app.use(cookieParser());
app.use(expressFileUpload());
app.use(hpp());
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
});
app.use(limiter);

const port = process.env.PORT || 5000;

const bootCampRoutes = require('./routes/bootcamp');
const courseRoutes = require('./routes/course');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reviewRoutes = require('./routes/review');

//Routes
app.use('/api/v1/bootcamp', bootCampRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/review', reviewRoutes);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} at port ${process.env.PORT}`.cyan
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error : ${err.message}`);
  server.close(() => process.exit(1));
});
