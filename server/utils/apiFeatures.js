class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.filters = {};
  }

  // Text search
  search() {
    // support both ?q= and ?search=
    const searchTerm = this.queryStr.q || this.queryStr.search;
    if (searchTerm) {
      const searchObj = { $text: { $search: searchTerm } };
      this.filters = { ...(this.filters || {}), ...searchObj };
      this.query = this.query.find(searchObj);
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludeFields = ['search', 'q', 'sort', 'page', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // 1. Handle flat keys with brackets: price[lte]=300 -> { price: { lte: 300 } }
    Object.keys(queryObj).forEach(key => {
      const match = key.match(/^(.+)\[(gte|gt|lte|lt|in)\]$/);
      if (match) {
        const [ , field, op] = match;
        if (!queryObj[field]) queryObj[field] = {};
        queryObj[field][op] = queryObj[key];
        delete queryObj[key];
      }
    });

    // 2. Field mapping (aliasing singular to plural/db fields)
    const fieldMap = {
      mood: 'moods',
      path: 'readingPaths',
      categorySlug: 'category',
    };

    Object.keys(fieldMap).forEach(key => {
      if (queryObj[key]) {
        queryObj[fieldMap[key]] = queryObj[key];
        delete queryObj[key];
      }
    });

    // 3. Advanced filtering (gte, gt, etc.) and numeric casting
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);
    const parsed = JSON.parse(queryString);

    const numericFields = ['price', 'stock', 'rating', 'originalPrice', 'discount', 'publishedYear', 'pages', 'numReviews'];
    Object.keys(parsed).forEach(key => {
      if (numericFields.includes(key)) {
        if (typeof parsed[key] === 'object') {
          Object.keys(parsed[key]).forEach(op => {
            if (!isNaN(parsed[key][op])) parsed[key][op] = Number(parsed[key][op]);
          });
        } else if (!isNaN(parsed[key])) {
          parsed[key] = Number(parsed[key]);
        }
      }
      
      if (typeof parsed[key] === 'string' && parsed[key].includes(',')) {
        parsed[key] = { $in: parsed[key].split(',') };
      }
    });

    this.filters = { ...(this.filters || {}), ...parsed };

    this.query = this.query.find(parsed);
    return this;
  }

  // Sort
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  paginate() {
    const page = Math.max(1, parseInt(this.queryStr.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(this.queryStr.limit, 10) || 12));
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;
