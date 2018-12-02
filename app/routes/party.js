var express = require("express");
var router  = express.Router();
var party = require("../models/party");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all party
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all party from DB
      party.find({name: regex}, function(err, allparty){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allparty);
         }
      });
  } else {
      // Get all party from DB
      party.find({}, function(err, allparty){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allparty);
            } else {
              res.render("party/index",{party: allparty, page: 'party'});
            }
         }
      });
  }
});

//CREATE - add new party to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to party array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newparty = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new party and save to DB
    party.create(newparty, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to party page
            console.log(newlyCreated);
            res.redirect("/party");
        }
    });
  });
});

//NEW - show form to create new party
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("party/new");
});

// SHOW - shows more info about one party
router.get("/:id", function(req, res){
    //find the party with provided ID
    party.findById(req.params.id).populate("comments").exec(function(err, foundparty){
        if(err){
          console.log(err);
        } else {
          console.log(foundparty)
          //render show template with that party
          res.render("party/show", {party: foundparty});
        }
    });
});

router.get("/:id/edit", middleware.checkUserparty, function(req, res){
    //find the party with provided ID
    party.findById(req.params.id, function(err, foundparty){
        if(err){
            console.log(err);
        } else {
            //render show template with that party
            res.render("party/edit", {party: foundparty});
        }
    });
});

router.put("/:id", function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    party.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, party){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/party/" + party._id);
        }
    });
  });
});

router.delete("/:id", function(req, res) {
  party.findByIdAndRemove(req.params.id, function(err, party) {
    Comment.remove({
      _id: {
        $in: party.comments
      }
    }, function(err, comments) {
      req.flash('error', party.name + ' deleted!');
      res.redirect('/party');
    })
  });
});

module.exports = router;
