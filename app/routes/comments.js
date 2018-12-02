var express = require("express");
var router  = express.Router({mergeParams: true});
var party = require("../models/party");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find party by id
    console.log(req.params.id);
    party.findById(req.params.id, function(err, party){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {party: party});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup party using ID
   party.findById(req.params.id, function(err, party){
       if(err){
           console.log(err);
           res.redirect("/party");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               party.comments.push(comment);
               party.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/party/' + party._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
    // find party by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("comments/edit", {party_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/party/" + req.params.id);
       }
   });
});

router.delete("/:commentId",middleware.checkUserComment, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
            party.findByIdAndUpdate(req.params.id, {
              $pull: {
                comments: comment.id
              }
            }, function(err) {
              if(err){
                console.log(err)
              } else {
                req.flash('error', 'Comment deleted!');
                res.redirect("/party/" + req.params.id);
              }
            });
        }
    });
});

module.exports = router;
