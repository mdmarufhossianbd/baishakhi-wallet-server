const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
const app = express();

app.use(cors())
app.use(express.json())


// mongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    const userCollection = client.db('Baishakhi-Wallet').collection('users')

    // user create
    app.post('/user', async(req, res)=>{
        const user = res.body
        console.log(user);
    })

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// server
app.get('/', (req, res) => {
    res.send('Welcome to Baishakhi server and it is running')
  })
  
  app.listen(port, () => {
    console.log(`Baishakhi server is running on ${port}`);
  })