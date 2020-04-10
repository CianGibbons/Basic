class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // this stores the query (ie. Model.find() to this objects global 'query' field)
    this.queryString = queryString; //this stores the query string (ie. ?name='Joe'&surname='Bloggs') to this objects global 'queryString' field
  }

  filter() {
    const queryObj = { ...this.queryString };//deconstruct the querystring and store it into the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // these are fields in which we dont want store in the queryObject as we are going to use them in other method of this API Features class
    excludedFields.forEach(el => delete queryObj[el]);
    // Advanced Filtering 
    //allows for comparators such as // gte, gt, lt, lte // >=,>,<,<= // eg. ?duration[gte]=5
    let queryStr = JSON.stringify(queryObj); //stringify the queryobject so we can user the .replace JS method
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //\b makes sure that it takes this exact string not just this string within a word
    //g means that it can appear multiple times, not just replace the first occurance
    this.query = this.query.find(JSON.parse(queryStr)); //parse back to an object and find the result with the query and store it

    return this; 
  }

  sort() {
    if (this.queryString.sort) {
      //eg. ?sort=price sorts price from lowest to highest // ?sort=-price the opposite
      //to add secondary criteria separate with comma in the url // ?sort=price,ratingsAverage
      //swaps the comma with a space because mongo expects a space
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else { // by default sort by createdAt field
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) { //using fields=name,username we could just select the name and username for this query
      const fields = this.queryString.fields.split(',').join(' ');// mongo expects a space in between .select() fields so .replace the ',' with a ' '
      this.query = this.query.select(fields); //select the fields and save the query
    } else {
      this.query = this.query.select('-__v');// dont select the __v by default
      // if the user doesnt specify fields, dont send back the __v field because we dont use that, it is used by mongodb itself
    }
    return this;
  }

  paginate() {
    // ?page=2&limit=10, 1-10 page 1, 11-20 page 2, etc...
    // to get to page two you skip 10 because the limit is ten
    //query = query.skip(10).limit(10);
    const page = this.queryString.page * 1 || 1; //default page 1
    const limit = this.queryString.limit * 1 || 100; //default limit results per page to be 100
    const skip = (page - 1) * limit; //calculate how many documents to skip 
    this.query = this.query.skip(skip).limit(limit); //add this to the query

    return this;
  }
}
module.exports = APIFeatures;//export the APIFeatures class
