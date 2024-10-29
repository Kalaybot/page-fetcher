const needle = require('needle');
const fs = require('fs');
const readline = require('readline');

// command line for url and filepath
const url = process.argv[2];
const filePath = process.argv[3];

// if tatement to check if both are provided
if (!url || !filePath) {
  console.error('Need to provide URL an local file path');
  process.exit(1);
}

// uses readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// this is the function to grab and write data
const dataFetcher = () => {
  needle.get(url, (error, response) => {
    if (error) {
      console.error(`Error fetching the URL "${url}": ${error.message}`);
      rl.close();
      process.exit(1);
    }
    if (response.statusCode !== 200) {
      console.error(`Failed to fetch URL. Status code: ${response.statusCode}`);
      rl.close();
      process.exit(1);
    }

    // writes data to the file path asynchronously
    fs.writeFile(filePath, response.body, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        rl.close();
        process.exit(1);
      }

      console.log(`Downloaded and saved ${response.body.length} bytes to ${filePath}`);
      rl.close();
    });
  });
};

// checks if file already exists
fs.access(filePath, fs.constants.F_OK, (fileExistsError) => {
  if (!fileExistsError) {
    
    // if file is exists it will ask for confirmation
    rl.question(`File "${filePath}" already exists. Overwrite? (Y to confirm): `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        dataFetcher();
      } else {
        console.log('Operation cancelled. File was not overwritten.');
        rl.close();
        process.exit(0);
      }
    });
  } else {
    // If the file does not exist, proceed with fetching and saving
    dataFetcher();
  }
});