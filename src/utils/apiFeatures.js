export class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'keyword'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //* Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.trim();
      if (keyword) {
        let searchConditions = {};

        if (modelName === 'Product') {
          searchConditions = {
            $or: [
              { title: { $regex: keyword, $options: 'i' } },
              { description: { $regex: keyword, $options: 'i' } },
            ],
          };
        } else {
          searchConditions = {
            name: { $regex: keyword, $options: 'i' },
          };
        }

        this.query = this.query.find(searchConditions);
      }
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate(totalDocuments) {
    const page = Math.max(1, this.queryString.page * 1 || 1);
    const limit = Math.max(1, this.queryString.limit * 1 || 50);
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // pagination result
    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalDocuments / limit),
    };

    // next and prev page number
    if (endIndex < totalDocuments) {
      pagination.next = page + 1;
    }
    if (page > 1) {
      pagination.prev = page - 1;
    }

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = pagination;

    return this;
  }
}
