const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

//Middleware to Serve Static Data
app.use(express.static(path.join(__dirname, "public")));

let message = "Wouldn't you like to be a pepper too???";

function sendMessage()
{
    console.log(message);
}

//sendMessage();

//Our first example route
app.get("/", function(req,res){
    //res.send("Hello Everyone!");
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/testjson", (req,res)=>{
    res.sendFile(path.join(__dirname, "public", "json/games.json"));
});

app.get("/statuscode", (req,res)=>{
    res.sendStatus(404);
})

setTimeout(()=>{
    console.log("Hello 2 seconds later");
}, 2000);

setTimeout(()=>{
    console.log("Hello now");
}, 0);


app.listen(port, function(){
    console.log(`Server is running on port: ${port}`);
});