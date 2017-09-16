var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

//APP CONFIG
mongoose.connect('mongodb://localhost/blog_app', { useMongoClient: true });
app.set("view engine", 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

//RESTful ROUTES

app.get("/", function(req, res){
  res.redirect('/blogs');
})
//INDEX ROUTE
app.get("/blogs", function(req, res){
  Blog.find({}, function(err, allBlogs){
    if (err) {
      console.log("ERROR!");
    } else {
      res.render("index", {blogs: allBlogs});
    }
  });
});
//NEW ROUTE
app.get("/blogs/new", function(req, res){
  res.render("new");
})
//CREATE ROUTE
app.post("/blogs", function(req, res){
  //create blog
  var data = req.body.blog;
  req.body.blog.body = req.snitizer(req.body.blog.body);
  Blog.create(data, function(err, newBlog){
    if (err) {
      res.render('new');
    } else {
      //redirect
      res.redirect("/blogs");
    }
  });
});
//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
  var blogId = req.params.id;
  Blog.findById(blogId, function(err, foundBlog){
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render("show", {blog: foundBlog});
    }
  })
});
//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
  var blogId = req.params.id;
  Blog.findById(blogId, function(err, foundBlog){
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});
//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
  var blogId = req.params.id;
  req.body.blog.body = req.snitizer(req.body.blog.body);
  Blog.findByIdAndUpdate(blogId, req.body.blog, function(err, updatedBlog){
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + blogId);
    }
  });
});
//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
  //destroy blog
  var blogId = req.params.id;
  Blog.findByIdAndRemove(blogId, function(err){
    if (err) {
      res.redirect("/blogs");
    } else {
      //redirect
      res.redirect("/blogs");
    }
  });
});

//set up server
app.listen(3000, function(){
  console.log("serving localhost 3000");
})
