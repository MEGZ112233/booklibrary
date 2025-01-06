const express =  require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
// Create an instance of Express 
const app =  express() ;

app.use(bodyParser.json()) ; 
app.use(cors()) ; 


// server ports

const port  =  process.env.PORT || 3000 ; 
const usersRoutes = require('./routes/users') ; 
app.use('/api' , usersRoutes) ; 
app.use(cors({ origin: '*' }));
app.listen(port , ()=> {
console.log("running on port 3000")
});