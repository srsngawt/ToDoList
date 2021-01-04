const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const  mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false);

var today = new Date();
   
var options = {
    weekday : "long",
    day : "numeric",
    month : "long"
};

var day = today.toLocaleDateString("hi-IN",options);

mongoose.connect("mongodb+srv://admin-shubham:cool123@cluster0.jwdkk.mongodb.net/todolistDB",{useNewUrlParser : true,  useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'Name not given, please Check']
    }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to the To-do List"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<--- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name:String,
    items:[itemSchema]
};

const List = mongoose.model("List", listSchema);

//Item.insertMany(defaultItems, function(err){
//    if(err){
//        console.log(err);
//    }
//    else{
//        console.log("Successfully save default Item to todolistDB");
//    }
//});

app.get('/',function(req, res){
    
    Item.find(function(err, toDoList){       
        if(toDoList.length == 0){
            Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Successfully save default Item to todolistDB");
                    }
                });
                res.redirect("/");
        }
        else{
            if(err){
                console.log(err);
            }
            else{
                res.render("list", {listTitle : "Today", typeOfDay : day, item : toDoList});
            }
        }
    }); 
});

app.get("/:customName",function(req,res){
    const newListName= _.capitalize(req.params.customName);
    List.findOne({name:newListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                //create new list
                const list = new List({
                    name:newListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+newListName);
            }
            else{
                res.render("list",{listTitle : foundList.name, typeOfDay : day, item : foundList.items});
            }
        }
    });
});

app.post("/", function(req,res){

    var newItem = req.body.t1;
    var newList = req.body.list;

    const item = new Item({
        name: newItem
    });

    if(newList == "Today"){
        item.save();
        res.redirect('/');
    }
    else{
        List.findOne({name:newList},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect('/'+newList);
        })
    }
  

});

app.post('/delete', function(req,res){
    var deleteItemId = req.body.checkbox;
    var newList = req.body.listName;
    if(newList == "Today"){
        Item.findByIdAndRemove({_id:deleteItemId}, function(err){
            if(!err){
                console.log("Successfully Deleted");
            }
            else{
                console.log(err);
            }
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name:newList},{$pull:{items:{_id:deleteItemId}}}, function(err, foundList){
            if(!err){
                res.redirect('/'+newList);
            }
        });
    }
    
});

app.listen(3000, function(){
    console.log("Hello, Server Activated on port 3000");
})
