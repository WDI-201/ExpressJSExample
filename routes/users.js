var express = require('express');
var router = express.Router();

var blogs = require("../public/sampleBlogs")
const blogPosts = blogs.blogPosts

const users = [{
  name: "James",
  role: "Instructor"
}, {
  name: "Ginny",
  role: "TA"
}]

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/myname', (req, res) => {
  const firstName = req.query.firstname
  const lastName = req.query.lastname
  res.send("The current user is: " + firstName + " "+ lastName)
})

router.get('/getone/:userNumber', (req, res) => {
  const userNumber = req.params.userNumber
  const foundUser = blogPosts[userNumber];
  //JSON: Javascript Object Notation
  res.json(foundUser)
})


module.exports = router;
