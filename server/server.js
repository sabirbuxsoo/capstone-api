//Entry Point of API
//Routes Setup here and all packages necessary are called here
const express = require('express');
const apiRouter = require('./routes');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/", apiRouter);



app.listen(process.env.PORT || '3000', () => {
    console.log(`Server is running on port: ${process.env.PORT || '3000'}`);
});

