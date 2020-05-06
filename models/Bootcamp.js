const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootCampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Add A Name'],
      unique: [true, 'Name Must Be Unique'],
      trim: true,
      maxlength: [50, 'The name cannot be greater than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please Add A Description'],
      unique: [true, 'Description Must Be Unique'],
      trim: true,
      maxlength: [500, 'The description cannot be greater than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use valid url with Http or Https',
      ],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please use a valid email address',
      ],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be atleast 1'],
      max: [10, 'Rating must not be greater than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssitance: {
      type: Boolean,
      default: false,
    },
    jobGurrantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BootCampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

BootCampSchema.pre('save', async function (next) {
  const [geoObj] = await geocoder.geocode(this.address);

  this.location = {
    type: 'Point',
    coordinates: [geoObj.longitude, geoObj.latitude],
    formattedAddress: geoObj.formattedAddress,
    street: geoObj.streetName,
    city: geoObj.city,
    state: geoObj.state,
    zipcode: geoObj.countryCode,
    country: geoObj.country,
  };

  this.address = undefined;
});

BootCampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

BootCampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

module.exports = mongoose.model('Bootcamp', BootCampSchema);
