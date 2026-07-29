# Custom User Instructions

## cPanel Deployment Build Rule
- When asked to generate a deployment file or build for cPanel (like `deploy_cpanel.zip`), **ALWAYS** use a Python script with the `zipfile` module to generate the ZIP archive. 
- **DO NOT** use the `zip` shell command, `bestzip`, `tar`, or `gzip` for creating the cPanel archive, as they cause "Archive is corrupt" or "End-of-central-directory" extraction errors on the user's hosting.
- Follow the process of compiling `dist`, moving necessary cPanel files (like `app.js`, `package.json`, `schema.sql`) to `deploy_folder`, and then running a python script to zip `deploy_folder` into `deploy_cpanel.zip`.
