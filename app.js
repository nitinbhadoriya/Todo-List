//jshint esversion:6

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.connect("mongodb+srv://admin-nitin:TXUDNgitxpAGj9T@cluster0.h5wwp.mongodb.net/TodoListdb",{useNewUrlParser:true,useUnifiedTopology:true});

const itemSchema=new mongoose.Schema({
  name:{
    type:String
  }
});
const listSchema=new mongoose.Schema({
  name:{
    type:String
  },
  items:[itemSchema]
});

const List=mongoose.model("list",listSchema);
const Item=mongoose.model("item",itemSchema);

const item1=new Item({
  name:"Demo to use this To-Do List."
});

const item2=new Item({
  name:"<- Check this checkbox to Delete an item."
});

const item3=new Item({
  name:"Enter new Items to Add below."
});

const arrayOfItem = [item1,item2,item3];



// Item.insertMany(arrayOfItem,function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Success");
//   }
// });



app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

// var object={
//   weekday:"long",
//   day:"numeric",
//   month:"long"
// };
// var today= new Date();
// var day=today.toLocaleDateString("en-US",object);
app.get("/",function(req,res){

  Item.find(function(err,data){
      if(data.length===0){
        Item.insertMany(arrayOfItem,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Success");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("home",{listTitle:"Today",ls:data});
      }

  });

});

app.get("/:customListNames",function(req,res){
  var cusList=_.capitalize(req.params.customListNames);
  List.findOne({name:cusList},function(err,value){
    if(!err){
      if(!value){
        const newItem=new List({
          name:req.params.customListNames,
          items:arrayOfItem
        });
        newItem.save();
        res.redirect("/"+cusList);
      }
      else {
        res.render("home",{listTitle:value.name,ls:value.items});
      }
    }

  });

});

app.post("/",function(req,res){
  const newItemName=req.body.newItem;
  const next=new Item({
    name:newItemName
  });
  const submitted_to=req.body.button;
  if(submitted_to==="Today"){
    next.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:submitted_to},function(err,val){
      if(!err){
        val.items.push(next);
        val.save();
        res.redirect("/"+submitted_to);
      }
    });
  }
});

app.post("/delete",function(req,res){
  const itemid=req.body.chk;
  const lsname=req.body.listName;
  if(lsname=="Today"){
    Item.deleteOne({_id:itemid},function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:lsname},{$pull:{items:{_id:itemid}}},function(err,result){
      if(!err){
        res.redirect("/"+lsname);
      }
    });
  }

});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(req){
  console.log("Server Started");
});
