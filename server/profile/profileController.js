var db = require('../config.js')
var User = require('../auth/userModel.js');

module.exports = {

  // handles GET req for a specific user's profile
  getProfileById: function(req, res) {
    User.findById(req.params.id, function(err, profile) {
      if (err) {
        res.send(err);
      } else {
        console.log(profile)
        res.json(profile);
      }
    })
  },

  // handles PUT req for a specific user's profile
  updateProfile: function(req, res) {
    User.findById(req.params.id, function(err, profile) {
      if (err) {
        res.send(err);
      }

      // if user updates their zipcode, update the db
      if (req.body.zipcode) {
        profile.zipcode = req.body.zipcode;
      }

      // if indicates they like (or don't like) sports, update the db
      if (req.body.sports) {
        profile.sports = req.body.sports;
      }
      
      // if indicates they like (or don't like) beauty, update the db
      if (req.body.beauty) {
        profile.beauty = req.body.beauty;
      }
      
      // if indicates they like (or don't like) other, update the db
      if (req.body.other) {
        profile.other = req.body.other;
      }
      
      // callback method to be run after our db is updated
      profile.save(function(err) {
        if (err) {
          res.send(err);
        }
        console.log(profile)
        res.json({ message: 'user updated!' })
      })
    });
  }
}



