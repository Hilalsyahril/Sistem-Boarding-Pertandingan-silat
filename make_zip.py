import zipfile
import os

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

os.system('rm -rf deploy_folder')
os.system('mkdir deploy_folder')
os.system('cp -r dist deploy_folder/dist')
# Remove any zips from deploy_folder/dist to avoid inception
os.system('rm -f deploy_folder/dist/*.zip')
os.system('rm -f deploy_folder/dist/*.tar.gz')
os.system('cp package_cpanel.json deploy_folder/package.json')
os.system('cp app_cpanel.js deploy_folder/app.js')
os.system('cp schema.sql deploy_folder/schema.sql')

if os.path.exists('public/deploy_cpanel.zip'):
    os.remove('public/deploy_cpanel.zip')

with zipfile.ZipFile('public/deploy_cpanel.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('deploy_folder', zipf)

print("Zip created successfully.")
os.system('cp public/deploy_cpanel.zip dist/deploy_cpanel.zip')
