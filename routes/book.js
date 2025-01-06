const express = require('express');
const router = express.Router();


// Get all the users 
router.get('/users', (req, res) => {
  res.json(data);
});
// Get a single user by ID 
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = data.find((x) => x.id == parseInt(id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// create a new user 

router.post('/users' ,(req,res)=>{
  const {name , age} = req.body ; 

  // validation
  if (!name || !age){
    return res.status(400).json({message : 'Name and age are required'});
  }
  const newUser = {
    id : data.length+1 , name , age
  };
  data.push(newUser); 
  res.status(201).json({message : "added succesfully !!"}) ; 
});

// Update an existing user by  ID 

router.put('/users/:id' , (req,res)=>{
  const {id}  = req.params ; 
  const {name ,  age} =  req.body ; 
  if (!name || !age) {
    return res.status(400).json({message : "name or age is missing"}) ; 
  }
  const user = data.find((x)=> x.id==parseInt(id)) ;
  if (!user){
    return res.status(404).json({message : 'user not found'}) ; 
  }
  user.name =  name ; 
  user.age = age ; 
  res.json(user) ; 
});
router.delete('/users/:id' , (req,res) => {
  const {id}  =  req.params ; 
  data = data.filter((x) => x.id !== parseInt(id));
  res.sendStatus(204);
})
module.exports = router ; 