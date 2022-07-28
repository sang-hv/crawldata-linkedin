export EXCEL_NAME="Linkedin_data_$(date '+%Y-%m-%d_%H-%M-%S')"
node process/create-excel-file.js
node pages/linkedin.js

