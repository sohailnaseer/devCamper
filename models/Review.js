const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title'],
    maxLength: [10, 'Title length should atleast be 10 characters'],
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

reviewSchema.statics.getAverageRating = async function (bootcampId) {
  console.log('average rating middleware');

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

reviewSchema.pre('remove', function (next) {
  this.constructor.getAverageRating(this.bootcamp);
  next();
});

reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
