export class ApiFeatures {
  constructor(query, mongooseQuery) {
    this.query = query;
    this.mongooseQuery = mongooseQuery;
  }

  sort() {
    this.mongooseQuery.sort(this.query.sort);

    return this;
  }
  
  paginate() {
    const { page = 1, limit = 5} = this.query;
    const skip = (page - 1) * limit;

    this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }

  filter() {
    const { page = 1, limit = 5, sort, ...filters } = this.query;
    const filtersAsString = JSON.stringify(filters);
    const replasedFilters = filtersAsString.replaceAll(
      /gte|gt|lte|lt|eq|ne|regex/g,
      (match) => `$${match}`
    );
    const parsedFilters = JSON.parse(replasedFilters);

    this.mongooseQuery.find(parsedFilters);
    
    return this;
  }
}