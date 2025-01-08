const express =  require('express');
const bodyParser = require('body-parser');

const app =  express() ;

app.use(bodyParser.json()) ; 



const port  =  process.env.PORT || 3000 ; 
const bookRoutes = require('./routes/book') ; 
const locationRoutes = require('./routes/location') ;
app.use('/api' , bookRoutes) ; 
app.use('/api' , locationRoutes) ;
app.listen(port , ()=> {
console.log("running on port 3000")
});