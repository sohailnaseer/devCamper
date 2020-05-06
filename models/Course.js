const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add a weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarShipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
  },
});

courseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log('average cost middleware');

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {
          $avg: '$tuition',
        },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

courseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

courseSchema.pre('remove', function (next) {
  this.constructor.getAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model('Course', courseSchema);
