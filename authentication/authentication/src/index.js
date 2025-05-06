const express = require("express");
require("dotenv").config();
const connectionDB = require("./config/database");
const routes = require("./routes/routes.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log(`Project running ${port}`);
});

app.use(bodyParser.json());
app.use('/api/v1', routes);
connectionDB();