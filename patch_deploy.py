import re

with open('.github/workflows/deploy.yml', 'r') as f:
    content = f.read()

new_prepare = """    - name: Prepare Deployment
      run: |
        mkdir deploy_folder
        # Salin folder hasil build (dist) yang berisi UI & Server
        cp -r dist deploy_folder/
        
        # Buat package.json khusus production untuk cPanel
        cat << 'PKG' > deploy_folder/package.json
        {
          "name": "boarding-silat-prod",
          "version": "1.0.0",
          "dependencies": {
            "express": "^4.21.2",
            "mysql2": "^3.11.0",
            "dotenv": "^17.2.3"
          }
        }
        PKG
        
        # Gunakan app.cjs sebagai app.js (Entry point cPanel)
        cp app.cjs deploy_folder/app.js
"""

content = re.sub(
    r'    - name: Prepare Deployment\n      run: \|\n        mkdir deploy_folder.*?cp app\.js deploy_folder/ 2>/dev/null \|\| true\n',
    new_prepare,
    content,
    flags=re.DOTALL
)

with open('.github/workflows/deploy.yml', 'w') as f:
    f.write(content)
