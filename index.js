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
    // await client.connect();
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

app.get("/foods/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const food = await foodscollection.findOne({ _id: new ObjectId(id) });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


   // my food api

   app.post('/myfoods', async (req, res) => {
  const food = req.body;
  const result = await myfoodscollection.insertOne(food);
  res.send(result);
});


app.get('/myfoods', async (req, res) => {
  const email = req.query.email;
  const result = await myfoodscollection
    .find()
    .toArray();

  res.send(result);
});

//delete myfood

const { ObjectId } = require("mongodb");

app.delete('/myfoods/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid food ID" });
    }

    const result = await myfoodscollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
//update my food

app.get('/myfoods/:id', async (req, res) => {
  const id = req.params.id;
  const result = await myfoodscollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});
app.put('/myfoods/:id', async (req, res) => {
  const id = req.params.id;
  const updatedFood = req.body;

  const result = await myfoodscollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        food_name: updatedFood.food_name,
        quantity: updatedFood.quantity,
        location: updatedFood.location,
        expire_date: updatedFood.expire_date,
        notes: updatedFood.notes,
      },
    }
  );

  res.send(result);
});



//food request

app.post("/food-requests", async (req, res) => {
  try {
    const request = req.body; // { userEmail, name, photoURL, foodId, location, reason, contact, status: 'pending' }
    const result = await foodRequestsCollection.insertOne(request);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});





// 2. Get requests for a specific food (Food Owner only)
app.get("/food-requests/:foodId", async (req, res) => {
  try {
    const foodId = req.params.foodId;
    const requests = await foodRequestsCollection
      .find({ foodId: foodId })
      .toArray();
    res.send(requests);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 3. Update request status (Accept / Reject)
app.patch("/food-requests/:requestId", async (req, res) => {
  try {
    const { status } = req.body; // accepted / rejected
    const requestId = req.params.requestId;

    const request = await foodRequestsCollection.findOne({ _id: new ObjectId(requestId) });
    if (!request) return res.status(404).send({ message: "Request not found" });

    await foodRequestsCollection.updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status } }
    );

    // If accepted, update the food status to "donated"
    if (status === "accepted") {
      await foodscollection.updateOne(
        { _id: new ObjectId(request.foodId) },
        { $set: { food_status: "donated" } }
      );
    }

    res.send({ message: "Request updated successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.listen(port, () => {
//   console.log(`My app listening on port ${port}`)
// })


module.exports = app;