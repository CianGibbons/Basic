module.exports = fn => {// this function is used instead of a trycatch block
  return (req, res, next) => {
    fn(req, res, next).catch(next);//catches the error and moves onto the next middleware
  };
};
