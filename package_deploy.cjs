const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure dist exists
if (!fs.existsSync('dist/server.cjs')) {
    console.error("Please run npm run build first.");
    process.exit(1);
}

// Clean old deploy_folder
if (fs.existsSync('deploy_folder')) {
    fs.rmSync('deploy_folder', { recursive: true, force: true });
}
fs.mkdirSync('deploy_folder');

// Copy files
fs.cpSync('dist', 'deploy_folder/dist', { recursive: true });
fs.copyFileSync('package_cpanel.json', 'deploy_folder/package.json');
fs.copyFileSync('app_cpanel.js', 'deploy_folder/app.js');
fs.copyFileSync('schema.sql', 'deploy_folder/schema.sql');

// Fix app.js to point to dist/server.cjs
fs.writeFileSync('deploy_folder/app.js', "require('./dist/server.cjs');\n");

// Delete old zip
if (fs.existsSync('deploy_cpanel.zip')) {
    fs.unlinkSync('deploy_cpanel.zip');
}

// Create new zip
try {
    execSync('cd deploy_folder && zip -r ../deploy_cpanel.zip .');
    console.log("Successfully created deploy_cpanel.zip");
} catch (e) {
    console.error("Failed to create zip:", e);
}
