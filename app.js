//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectID;
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:olXoldscS6bS2JqV@cluster0.ds09n.mongodb.net/todolistDB")


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: Array
}

const List = mongoose.model("List", listSchema);

const item1 = new Item ({
  name: "This is your to-do list"
});


const item2 = new Item ({
  name: "Click + to add an item"
});

const item3 = new Item ({
  name: "<- Click here to delete"
});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {

  Item.find({}, (err, results) => {
    if (results.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) {
          console.log(err);
        } else {
          console.log("Items were inserted successfully");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  })
});

app.get("/:listName", (req, res) => {

  const listName = _.capitalize(req.params.listName);

  List.findOne({name: listName}, (err, results) => {
    if (!results) {
      const list = new List({
        name: listName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + listName);
      //
    } else {
      res.render("list", {listTitle: results.name, newListItems: results.items});


    }
  })


})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }

    })
  }

});

app.post("/delete", (req, res) => {
  checkedItemID = req.body.checkbox;
  listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, err => {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: ObjectId(checkedItemID)}}}, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    })
  }

})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port " + port);
});
