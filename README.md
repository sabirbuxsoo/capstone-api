1. Latest Version of Node and must be installed

2. First run npm install to get all packages

3. Run npm run dev to start the api and run it

API needs to run at all times.

All files are found in the server folder

Please make sure to modify the MySQL data on line 3 to 8 from db/index.js and replace the information with your MySQL database access information after importing the database.

API also needs to be connected to a MySQL Database to work. The server must have MySQl Installed and the database file `inform-db.sql` needs to be imported as it will be used for the API to store data.

All Database Requests are made in db/index.js and all queries can be found there

All API routes are setup in routes/index.js


The public folder should be made writable by the server to allow images to be uploaded and saved.

Server.js is the entry point of the app

If you encounter any issues, please email Sabir Buxsoo at bxsmuh001@myuct.ac.za

Happy hacking! 
