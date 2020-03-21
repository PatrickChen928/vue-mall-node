const express = require('express');
const router = express.Router();

/* GET Home page. */
router.all('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;
