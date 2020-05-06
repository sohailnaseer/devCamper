module.exports = (Model, populate) => {
  return async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((field) => delete reqQuery[field]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    query = Model.find(JSON.parse(queryStr));

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query.select(fields);
    }

    if (req.query.sort) {
      const fields = req.query.sort.replace(',', ' ');
      query.sort(fields);
    } else {
      query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    if (populate) {
      query = query.populate(populate);
    }

    const data = await query;
    res.advancedResults = {
      success: true,
      count: data.length,
      pagination,
      data,
    };

    next();
  };
};
