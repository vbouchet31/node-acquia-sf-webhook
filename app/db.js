/*const mysql = require('mysql2/promise')

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1'
const MYSQL_PORT = process.env.MYSQL_PORT || '3306'
const MYSQL_USER = process.env.MYSQL_USER || 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'AunLvcqxPKT9*2'
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'acsf-sf-webhook'

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;*/

let gdrive = {}

const {google} = require('googleapis')
const path = require('path')

const logger = require('./logger')

const DB_FILE = process.env.GDRIVE_DB_FILE || '1I8MwoBX1oUgY7qOpXrzuRlufUWqHkoIX3HxM7I8mc18'
const CLIENT_EMAIL = process.env.GDRIVE_CLIENT_EMAIL
const PRIVATE_KEY = process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n')
const CREDENTIALS_FILENAME = process.env.GDRIVE_CREDENTIALS_FILENAME

gdrive.getClient = () => {
  let creds
  if (CREDENTIALS_FILENAME) {
    creds = require(path.resolve(`${ __dirname }/../${ CREDENTIALS_FILENAME }`))
  }
  else if (CLIENT_EMAIL && PRIVATE_KEY) {
    creds = {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY
    }
  }

  if (typeof creds === 'undefined') {
    throw new Error('Impossible to find Google Drive credentials.')
  }

  const auth = new google.auth.JWT(
    creds.client_email, null,
    creds.private_key, ['https://www.googleapis.com/auth/spreadsheets']
  );

  return client = google.sheets({ version: "v4", "auth": auth });
}

gdrive.getTable = async (table) => {
  const client = gdrive.getClient()

  logger.debug('Fetching sheet "' + table + '" from Google Drive spreadsheet.')

  return client.spreadsheets.values.get({
    spreadsheetId: DB_FILE,
    range: `${table}!A:F`
  }).then(res => {
    // Take the first row which contains the column names.
    const fields = res.data.values[0];
    res.data.values.splice(0, 1);

    // Browse the rows and created objects with attribute names from the first row.
    const rows = res.data.values;
    const result = [];
    if (rows.length) {
      rows.map((row) => {
        const data = {};

        fields.map((field, index) => {
          try {
            data[field] = JSON.parse(row[index]);
          } catch (e) {
            data[field] = row[index];
          }

        });

        result.push(data);
      });
    }
    return result;
  }).catch(err => {
    logger.error(err)
    return []
  })
}

module.exports = gdrive
