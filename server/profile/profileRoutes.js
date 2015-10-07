var profileController = require('./profileController.js');
var express = require('express');
var router = express.Router();

module.exports = function(router) {

  // assigns the user ID to req.id for us to use in our controller
  router.param('id', function(req, res, next, id) {
    req.id = id;
    next();
  });

  // route requests to user's profile page
  router.route('/:id')

    // GET req; get a user profile
    .get(profileController.getProfileById)

    // PUT req; update user's profile
    .put(profileController.updateProfile);

};
