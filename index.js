const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@chill-gamer-101.wielvxx.mongodb.net/?retryWrites=true&w=majority&appName=Chill-Gamer-101`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const gameCollection = client.db('gameDB').collection('games');
        const usersCollection = client.db('gameDB').collection('users');

        // ✅ TEMP FIX: Convert all users to have an empty myReviews array
        await usersCollection.updateMany({}, { $set: { myReviews: [] } });
        console.log('All user myReviews fields reset to empty arrays.');

        app.get('/games', async (req, res) => {
            const result = await gameCollection.find().toArray();
            res.send(result);
        })

        app.get('/games/:id', async (req, res) => {
            const id = req.params.id;
            const result = await gameCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        app.post('/games', async (req, res) => {
            const newGame = req.body;
            console.log('Adding new Game', newGame);
            const result = await gameCollection.insertOne(newGame);
            res.send(result);
        })

        app.put('/games/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { $set: req.body };
            const result = await gameCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/games/:id', async (req, res) => {
            const id = req.params.id;
            const result = await gameCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        })



        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log('Add new User', newUser);
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })




        // code for my reviews

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const result = await usersCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        })

app.patch('/users', async (req, res) => {
  const { userID, reviewID, gameId } = req.body;
  const filter = { _id: new ObjectId(userID) };
  const updateDoc = {};

  if (reviewID) {
    updateDoc.$push = { myReviews: reviewID };
  }

  if (gameId) {
    updateDoc.$push = { ...(updateDoc.$push || {}), myWatchlist: gameId };
  }

  if (!updateDoc.$push) {
    return res.status(400).send({ message: 'No valid data to update.' });
  }

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});





    } finally {
        // Ensures that the client will close when you finish/error
        //    console.error('Error in run():', error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
