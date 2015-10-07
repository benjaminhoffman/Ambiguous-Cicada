var db = require('../config.js')


// do i need to require the config and server file?

module.exports = {

  getProfileById: function(req, res) {
    db.findById(req.params.id, function(err, profile) {
      if (err) {
        res.send(err);
      } else {
        res.json(profile);
      }
    })
  },

  updateProfile: function(req, res) {
    db.findById(req.params.id, function(err, profile) {
      if (err) {
        res.send(err);
        // in bear example, 'value' is holder for name, but i dont know why it did this
        // profile.value = req.body.value
      }
      profile.save(function(err) {
        if (err) { res.send(err) }
        res.json({ message: 'user updated!' })
      })
    });


  }
}



