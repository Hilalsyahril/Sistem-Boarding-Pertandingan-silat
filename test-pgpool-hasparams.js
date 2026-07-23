const params = ['a', 'b', 'c'];
let newParams = [];
let hasParams = false;
let text = "SELECT * FROM pesilat";
let sql = text.replace(/\$([0-9]+)/g, (match, p1) => {
  hasParams = true;
  const index = parseInt(p1, 10) - 1;
  newParams.push(params[index]);
  return "?";
});
let finalParams = hasParams ? newParams : params;
console.log({sql, finalParams});
