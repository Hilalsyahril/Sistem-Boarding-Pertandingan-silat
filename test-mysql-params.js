const sql = "UPDATE pesilat SET is_playing = $2, timer = $3 WHERE id = $1 AND arena = $4";
const params = ['id_value', 'playing_value', 'timer_value', 'arena_value'];

let newParams = [];
let newSql = sql.replace(/\$([0-9]+)/g, (match, p1) => {
  const index = parseInt(p1, 10) - 1;
  newParams.push(params[index]);
  return "?";
});

console.log(newSql);
console.log(newParams);
