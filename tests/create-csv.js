
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const fs = require('fs');
const csvWriter = require('csv-write-stream')
let writer = csvWriter({ sendHeaders: false }) //Instantiate var
const csvFilename = './myfile.csv'

// If CSV file does not exist, create it and add the headers
if (!fs.existsSync(csvFilename)) {
    writer = csvWriter({sendHeaders: false});
    writer.pipe(fs.createWriteStream(csvFilename));
    writer.write({
        header1: 'DATE',
        header2: 'LASTNAME',
        header3: 'FIRSTNAME'
    });
    writer.end();
}

// Append some data to CSV the file
writer = csvWriter({sendHeaders: false});
writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
writer.write({
    header1: '2018-12-31',
    header2: 'Smith',
    header3: 'John'
});
writer.end();

// Append more data to CSV the file
writer = csvWriter({sendHeaders: false});
writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
writer.write({
    header1: '2019-01-01',
    header2: 'Jones',
    header3: 'Bob'
});
writer.end();