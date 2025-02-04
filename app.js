const express = require("express");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Int32 } = require("bson");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Person = require("./models/Person");
const { register } = require("module");

const app = express();
const port = process.env.port||3000;

//Create public folder as static
app.use(express.static(path.join(__dirname, "public")));

//Set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret:"12345",
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false} //Set to true if using https
}))

function isAuthenticated(req,res, next){
    if (req.session.user)return next();
    return res.redirect("/loginpage.html");
}

//MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudapp";
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

//App Routes
const protected = ["/mainpage.html", "/addentry.html", "/updateentry.html"]

//Setup Mongoose Schema
const charecterSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    faction:String
});

const Charecter = mongoose.model("Charecter", charecterSchema, "starwarsdata");

//App Routes

app.get("/register.html", (req,res)=>{
    res.sendFile(path.join(__dirname,"public","register.html"));
});

app.post("/register.html", async (req,res)=>{
    try{
        const {username, password, email} = req.body;

        const exsistingUser = await User.findOne({username});

        if(exsistingUser){
            return res.send("Username already taken. Try a different one.")
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({username, password:hashedPassword, email});
        await newUser.save();

        res.redirect("/loginpage.html");

    }catch(err){
        res.status(500).send("Error registering new user.")
    }
});

app.get("/", (req,res)=>{
    res.sendFile("index.html");
});

app.get("/mainpage.html", isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, "private", "mainpage.html"));
});

app.get("/addentry.html", isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, "private", "addentry.html"));
});

app.get("/updateentry.html", isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname, "private", "updateentry.html"));
});

app.get("/loginpage", (req,res)=>{
    res.sendFile(path.join(__dirname + "/public/loginpage.html"));
})


app.get("/charecter", async(req,res)=>{
    try{
        const charecterdata = await Charecter.find();
        res.json(charecterdata);
        console.log(charecterdata);
    }catch(err){
        res.status(500).json({error:"Failed to get charecters."});
    }
});

app.get("/charecter/:id", async(req,res)=>{
    try{
        const charecter = await Charecter.findById(req.params.id);
        if (!charecter){
            return res.status(404).json({error:"Charecter not found."});
        }
        res.json(charecter);

    }catch(err){
        res.status(500).json({error:"Failed to get charecter."});
    }
});

//Create Routes
app.post("/addcharecter", async (req,res)=>{
    try{
        const newCharecter = new Charecter(req.body);
        const saveCharecter = await newCharecter.save();
        //res.status(201).json(savePerson);
        res.redirect("/");
        console.log(saveCharecter);
    }catch(err){
        res.status(501).json({error:"Failed to add new charecter."});
    }
});

//Update Route
app.put("/updatecharecter/:id", (req,res)=>{
    Charecter.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true

    }).then((updatedCharecter)=>{
        if(!updatedCharecter){
            return res.status(404).json({error:"Failed to find charecter."});
        }
        res.json(updatedCharecter);
    }).catch((err)=>{
        return res.status(400).json({error:"Failed to update the charecter."});
    });
});

//Delete Route
app.delete("/deletecharecter/:id", async (req, res) => {
    try {
        const { id } = req.params; // Extract the character's id from the URL
        const charecter = await Charecter.findById(id); // Use findById to find a character by its id

        if (!charecter) {
            return res.status(404).json({ error: "Failed to find the character." });
        }

        await Charecter.findByIdAndDelete(id); // Delete the character by its id
        res.json({ message: "Character deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred while deleting the character." });
    }
});

app.post("/loginpage.html", async (req,res)=>{
    const {username, password} = req.body;
    console.log(req.body);

    const user = await User.findOne({username});

    if (user && bcrypt.compareSync(password, user.password)){
        req.session.user = username;
        return res.redirect("/mainpage.html");
    }
    req.session.error = "Invalid User";
    return res.redirect("/loginpage.html");
});

app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/loginpage.html");
    });
});


//Starts the server
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});