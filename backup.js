require("dotenv").config();
const mysql = require("mysql2");
const { Client } = require("pg");
const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
const { spawn } = require("child_process");
const fs = require("fs");

const backup = () => {
  const config = {
    backupName: process.env.BACKUP_NAME,
    databaseType: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
    bucketName: process.env.AWS_BUCKET,
    sendEmail: process.env.SEND_EMAIL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpEmail: process.env.SMTP_USER,
    smtpEmailPass: process.env.SMTP_PASS,
    smtpFromEmail: process.env.SMTP_FROM,
    smtpDestEmail: process.env.SMTP_TO,
  };
  console.log(config);

  // Backup filename
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const unixTimestamp = Math.floor(date.getTime() / 1000);
  const backupName = `${process.env.BACKUP_NAME}_${year}_${month}_${day}_${unixTimestamp}.sql`;
  console.log(backupName);

  // DB Connection details
  let connection;
  if (config.databaseType === "mysql") {
    connection = mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });
    console.log("Database connected.");
  } else if (config.databaseType === "postgresql") {
    connection = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });
    connection.connect();
    console.log("Database connected.");
  } else {
    console.log("Invalid database type");
    return;
  }

  // S3 bucket details
  AWS.config.update({
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey,
  });
  const s3 = new AWS.S3();
  const bucketName = config.bucketName;
  console.info({
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey,
  });

  //   connection.query(query, [`/tmp/${backupName}`], (error, results) => {
  //     if (error) {
  //       console.log(error);
  //       return;
  //     }

  // let query;
  // if (config.databaseType === "mysql") {
  //   query = `SELECT * FROM ${config.database} INTO OUTFILE ?`;
  // } else if (config.databaseType === "postgresql") {
  const file = fs.createWriteStream(`/tmp/${backupName}`);
  console.info(`create temp /tmp/${backupName}`);

  console.log("Starting pg_dump process...");
  const pgDump = spawn("pg_dump", [
    // `--host=${config.host}`,
    // `--port=${config.port}`,
    `--dbname=${config.database}`,
    `--username=${config.user}`,
    `--password=${config.password}`,
    `--format=c`,
    `--file=${`/tmp/${backupName}`}`,
  ]);

  console.log([
    `--host=${config.host}`,
    `--port=${config.port}`,
    `--dbname=${config.database}`,
    `--username=${config.user}`,
    `--password=${config.password}`,
    `--format=c`,
    `--file=${`/tmp/${backupName}`}`,
  ]);

  pgDump.on("error", (err) => {
    console.error(`pg_dump process error: ${err}`);
  });

  pgDump.stdout.pipe(file);

  //   pgDump.on("close", (code) => {
  //     console.log(`pg_dump process completed with code ${code}`);
  //   });

  pgDump.on("exit", (code) => {
    console.log(`pg_dump process exited with code ${code}`);
    // Upload the backup to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: `backups/${backupName}`,
      Body: require("fs").createReadStream(`/tmp/${backupName}`),
    };
    console.info(uploadParams);

    s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }

      //delete the local backup file
      // require("fs").unlinkSync(`/tmp/${backupName}`);

      console.log("Successfully upload backup to S3");

      if (JSON.parse(config.sendEmail)) {
        // Send an email after the backup is completed
        var transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: true,
          auth: {
            user: config.smtpEmail,
            pass: config.smtpEmailPass,
          },
        });
        var mailOptions = {
          from: config.smtpFromEmail,
          to: config.smtpDestEmail,
          subject: "Backup complete",
          text: "The backup process has been completed successfully",
          attachments: [{ path: `/tmp/${backupName}` }],
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }

      if (config.databaseType === "postgresql") {
        connection.end();
      }

      console.log("Backup completed successfully");
    });
  });
  // }

  // };
};

backup();

module.exports = backup;
