const express = require("express");
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Int32 } = require("bson");
const path = require("path");

const app = express();
const port = process.env.port||3000;

//Create public folder as static
app.use(express.static(path.join(__dirname, "public")));

//Set up middleware to parse json requests
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

//MongoDB connection setup
const mongoURI = "mongodb://localhost:27017/crudapp";
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});

//Setup Mongoose Schema
const charecterSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    faction:String
});

const Charecter = mongoose.model("Charecter", charecterSchema, "starwarsdata");

//App Routes
app.get("/", (req,res)=>{
    res.sendFile("index.html");
});


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


//Starts the server
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});