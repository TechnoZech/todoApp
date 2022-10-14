//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
mongoose.connect('mongodb+srv://doozydope:%21DHARMESh%401998@cluster0.reegma1.mongodb.net/todolistDB');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const itemSchema = {
  name: {
    type: String,
    required: true
  }
};

const Item = mongoose.model("Item", itemSchema);

const First = new Item({
  name: "Welcome to todo List"
});

const Second = new Item({
  name: "<== Click here to delete any todo."
});

const Third = new Item({
  name: "Use any custom URL tag to create new List"
});

const defaultItems = [First, Second, Third];

// <-----------------------------    NEW SCHEMA FOR CUSTOM URL   ----------------------------->

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  // const day = date.getDate();

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted Successfully!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }


  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  item.save();

  if(listName === "Today"){
    item.save();
      res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }





  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      res.redirect("/");
    }
    else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      })
    }
  })
});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });
   // <-----------------------------    CUSTOM URL   ----------------------------->

app.get('/:customListNameURL', function(req, res) {
  const customListName = _.capitalize(req.params.customListNameURL);


  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Creating new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListName);
      }
      else{
        //Sending exixting List
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  });



});




app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started Successfully");
});
