const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/public/deploy_cpanel.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log('Deploy zip created: ' + archive.pointer() + ' total bytes');
});

archive.on('error', function(err) { throw err; });

archive.pipe(output);
archive.directory(__dirname + '/deploy_folder/', false);
archive.finalize();
