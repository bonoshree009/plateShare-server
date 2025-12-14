const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 2000

require("dotenv").config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_username}:${process.env.DB_Password}@cluster0.o1xwxs0.mongodb.net/?appName=Cluster0`;
  

const admin = require("firebase-admin");
const serviceAccount = require("./adminkey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


//middleware
app.use(cors())
app.use(express.json())


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //api
     const database = client.db("plateshare");
      const foodscollection = database.collection("foods");
       const userscollection = database.collection("user")
       const myfoodscollection = database.collection("myfoods");
       const foodRequestsCollection =database.collection("foodRequests")



      
    //user api

  app.post('/users', async (req, res) => {
  try {
    const newuser = req.body;
    const email = newuser.email;

    const existinguser = await userscollection.findOne({ email });

    if (existinguser) {
      return res.status(200).json({ message: 'user already exists' });
    }

    const result = await userscollection.insertOne(newuser);
    res.status(201).json(result); // return the inserted document
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
   app.get('/users', async(req,res)=>{
      const cursor = userscollection.find()
     
    const result = await cursor.toArray();
    res.send(result)

    })




//food api

    app.post('/foods',async(req,res)=>{
        const newproduct = req.body;
        const result = await foodscollection .insertOne(newproduct)
         res.send(result)
    })

     app.get('/foods', async(req,res)=>{
      const cursor = foodscollection.find()
     
    const result = await cursor.toArray();
    res.send(result)

    })

   // latest food api

     app.get('/latest-food', async(req,res)=>{
      const cursor =foodscollection.find().sort({quantity:-1}).limit(6)
     
    const result = await cursor.toArray();
    res.send(result)

    })

    //single food api

