const express =  require('express');
const bodyParser = require('body-parser');

const app =  express() ;

app.use(bodyParser.json()) ; 



const port  =  process.env.PORT || 3000 ; 
const bookRoutes = require('./routes/book') ; 
const locationRoutes = require('./routes/location') ;
const book_locationRoutes = require('./routes/book_location') ; 
const book_topicRoutes = require('./routes/book_topic') ;
app.use('/api' , bookRoutes) ; 
app.use('/api' , locationRoutes) ;
app.use('/api' , book_locationRoutes) ; 
app.use('/api' , book_topicRoutes) ; 
app.listen(port , ()=> {
console.log("running on port 3000")
});