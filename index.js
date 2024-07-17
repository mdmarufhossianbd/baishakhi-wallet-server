const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
const app = express();
const cookieParser = require('cookie-parser');


app.use(cors({
    origin : 'http://localhost:5173',
    credentials: true,
}))
app.use(cookieParser());
app.use(express.json());


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
    app.post('/user', async(req, res) => {
        const user = req.body
        const existUser = await userCollection.findOne({email : user.email})
        if(existUser){
            const result = {message: 'This user is already exists',
                insertedId: null,
            }
            return res.json(result)
        }
        const hashedPassword = bcrypt.hashSync(user.password, 14);
        const newUser = {...user, password : hashedPassword};
        const token = jwt.sign({userEamil : newUser.email}, process.env.JWT_SECRET, {
            expiresIn : '1h' 
        })
        res.cookie('token', token, {
            httpOnly: true,
            secure : process.env.NODE_ENV === "production"
        })
        const result = await userCollection.insertOne(newUser);
        res.json(result);        
    })

    app.post('/login', async(req, res) => {
        const {email, password} = req.body;       
        const user = await userCollection.findOne({email})
        if(!user){
          const result = { message: 'Please check your email or password', status : 406 }
            return res.json(result);
        }
        const passwordMatched = bcrypt.compareSync(password, user.password);        
        if(!passwordMatched){
          const result = { message: 'Please check your email or password', status : 406 }
            return res.json(result);
        }

        const token = jwt.sign({email : user.email}, process.env.JWT_SECRET, {expiresIn : "1h"})

        res.cookie('token', token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite: 'Strict',
        })
        const result = { message: 'Login successful', status : 200 }
        res.json(result);
    })

    app.post('/logout', async(req, res) =>{
      const token = req.cookies.token;

      if(token){
        res.clearCookie('token')        
        return res.status(200).send("Logout Successfully")
      }
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