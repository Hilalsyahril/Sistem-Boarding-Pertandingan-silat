with open('.github/workflows/deploy.yml', 'r') as f:
    content = f.read()

if 'exclude:' not in content:
    content = content.replace('local-dir: ./deploy_folder/', 'local-dir: ./deploy_folder/\n        exclude: |\n          **/.htaccess\n          **/.env')

with open('.github/workflows/deploy.yml', 'w') as f:
    f.write(content)
