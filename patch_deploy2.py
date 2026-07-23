with open('.github/workflows/deploy.yml', 'r') as f:
    content = f.read()

content = content.replace('''        exclude: |
          **/.htaccess
          **/.env''', '''        exclude: |
          **/.htaccess
          .htaccess
          **/.env
          .env
          .ftp-deploy-sync-state.json
          .cl.selector
          .cagefs
          .npm
          .php''')

with open('.github/workflows/deploy.yml', 'w') as f:
    f.write(content)
