var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Default Route View With Index' });
});

router.get('/datetime', (req,res)=>{
  console.log(new Date())
  res.send(new Date())
})

module.exports = router;
