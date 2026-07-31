import zipfile
import os

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

# Ensure deploy_folder has latest
os.system('rm -rf deploy_folder')
os.system('mkdir deploy_folder')
os.system('cp -r dist deploy_folder/dist')
os.system('cp package_cpanel.json deploy_folder/package.json')
os.system('cp app_cpanel.js deploy_folder/app.js')
os.system('cp schema.sql deploy_folder/schema.sql')

# Fix app.js to point to dist/server.cjs
with open('deploy_folder/app.js', 'w') as f:
    f.write("require('./dist/server.cjs');\n")

if os.path.exists('public/deploy_cpanel.zip'):
    os.remove('public/deploy_cpanel.zip')

with zipfile.ZipFile('public/deploy_cpanel.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('deploy_folder', zipf)

print("Zip created successfully.")
os.system('cp public/deploy_cpanel.zip dist/deploy_cpanel.zip')
