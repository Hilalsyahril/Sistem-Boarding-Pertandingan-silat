import shutil
import os

# Delete old zip if exists
if os.path.exists('deploy_cpanel_fixed.zip'):
    os.remove('deploy_cpanel_fixed.zip')

# Create zip from deploy_folder
shutil.make_archive('deploy_cpanel_fixed', 'zip', 'deploy_folder')
print("Successfully created deploy_cpanel_fixed.zip")
