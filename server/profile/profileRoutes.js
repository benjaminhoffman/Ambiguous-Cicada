var profileController = require('./profileController.js');
var express = require('express');
var router = express.Router();


// do we need to require our userModel?

module.exports = function(router) {

  // ?? what is this??  is this router.param for an id?
  router.param('id', function(req, res, next, id) {
    req.id = id;
    next();
  });

  router.get('/', function(req, res, next) {
    console.log("TEST")
    res.send('respond with a resource')
  });

  // route requests to user's profile page
  // router.route('/profile/:id')

    // GET req; get a user profile
    // .get(profileController.getProfileById)

    // PUT req; update user's profile
    // .put(profileController.updateProfile);




    // .get(function(req, res) {
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     console.log(get)
    //   }
    // })


};
