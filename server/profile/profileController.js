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

      // if user updates their gender, update the db
      if (req.body.gender) {
        profile.gender = req.body.gender;
      }

      // if user updates their gender preference, update the db
      if (req.body.prefGender) {
        profile.prefGender = req.body.prefGender;
      }

      // if indicates they like (or don't like) sports, update the db
      if (req.body.interests.sports) {
        profile.sports = req.body.interests.sports;
      }
      
      // if indicates they like (or don't like) beauty, update the db
      if (req.body.interests.beauty) {
        profile.beauty = req.body.interests.beauty;
      }
      
      // if indicates they like (or don't like) other, update the db
      if (req.body.interests.other) {
        profile.other = req.body.interests.other;
      }
      
      // callback method to be run after our db is updated
      profile.save(function(err) {
        if (err) {
          res.send(err);
        }
        res.json({ message: 'user updated!' })
      })
    });
  }
}



