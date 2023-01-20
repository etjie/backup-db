# Backup Script

This script is designed to backup a MySQL or PostgreSQL database, upload the backup to an S3 bucket and send an email notification when the backup process is completed.

## Requirements

- Node.js
- npm
- MySQL or PostgreSQL
- AWS S3 bucket
- SMTP server

## Configuration

Create a configuration file ".env" which should contain the following properties:

- `BACKUP_NAME`: a string that contains the backup file name
- `DB_TYPE`: a string that indicates the type of database, either "mysql" or "postgresql"
- `DB_HOST`: a string that contains the hostname of the database server
- `DB_PORT`: a string that contains the port of the database server
- `DB_USER`: a string that contains the username used to connect to the database
- `DB_PASS`: a string that contains the password used to connect to the database
- `DB_NAME`: a string that contains the name of the database
- `AWS_ACCESS_KEY`: a string that contains the AWS access key
- `AWS_SECRET_KEY`: a string that contains the AWS secret key
- `AWS_BUCKET`: a string that contains the name of the S3 bucket
- `SEND_EMAIL`: a string that contains the condition 'true' or 'false' to send email
- `SMTP_HOST`: a string that contains the SMTP host for sending email
- `SMTP_PORT`: a string that contains the SMTP port for sending email
- `SMTP_USER`: a string that contains the SMTP username for sending email
- `SMTP_PASS`: a string that contains the SMTP password for sending email
- `SMTP_FROM`: a string that contains the sender email address
- `SMTP_FROM`: a string that contains the destination email address


## Run & Installation (with pm2)

1. Clone the repository
git clone https://github.com/etjie/backup-db.git

2. Install the dependencies
npm install

3. Create a configuration file, you can use the `.env.example` as a template and fill in your own values

4. Install PM2 globally
npm install pm2 -g

5. Run the script with PM2
pm2 start backup.js --name "backup"

6. To check the logs, you can check the logs by running 
pm2 logs backup

7. To stop the script, you can run 
pm2 stop backup

8. To start the script again
pm2 start backup

