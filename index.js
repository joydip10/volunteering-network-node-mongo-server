// const os=require('os');
// console.log('OS VERSION, ',os.version());
// console.log('OS Architecture, ',os.arch());

const fs = require('fs')
//fs.writeFileSync('hello.txt','Writing synchronously');
//fs.appendFileSync('hello.txt','\n Added some lines synchronously!');

// const read=fs.readFileSync('hello.txt');
// console.log(read); //returns buffer
// console.log(read.toString());

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wuxif.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 500;


app.get('/', (req, res) => {
  console.log(req.query);
  res.send('Hello World!')
})
async function run() {
  try {
    await client.connect();
    const database = client.db("volunteer");
    const eventCollection = database.collection("events");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");

    //API post
    app.post('/events', async (req, res) => {
      const newService = req.body;
      const result = await eventCollection.insertOne(newService);
      res.json(result);
    })

    //API GET
    app.get('/events', async (req, res) => {
      const cursor = eventCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    })

    //API POST myevents
    app.post('/orders', async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.json(result);
    })

    //API GET myevents
    app.get('/orders/:email', async (req, res) => {
      const queryEmail = req.params.email;
      const query = { email: queryEmail };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    })

    //API Method to delete an event
    app.delete('/orders/:id',async (req,res)=>{
      const id=req.params.id;
      const query={_id:ObjectId(id)};
      const result=await orderCollection.deleteOne(query);
      res.json(result);
    })
    //API for users management
    app.post('/users', async (req,res)=>{
      const newUser=req.body;
      const query={email: newUser.email};
      const findCursor= userCollection.find(query);
      const findResult= await findCursor.toArray();
      if(findResult.length===0){
        const result = await userCollection.insertOne(newUser);
        res.json(result);
      }
    })

    app.get('/users', async (req,res)=>{
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    })

  }
  finally {

  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})