try {
  require('./dist/server.cjs');
  console.log("Success load");
} catch(e) {
  console.log("Failed", e);
}
