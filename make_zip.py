import zipfile
import os

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            # Add file to zip archive, with relative path
            arcname = os.path.relpath(file_path, path)
            ziph.write(file_path, arcname)

with zipfile.ZipFile('deploy_cpanel.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('deploy_folder', zipf)
print("Zip created successfully.")
