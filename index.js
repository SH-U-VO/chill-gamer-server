const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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

        app.get('/games', async (req, res) => {
            const result = await gameCollection.find().toArray();
            res.send(result);
        })

        app.post('/games', async (req, res) => {
            const newGame = req.body;
            console.log(newGame);
            // res.json({
            //     status: true,
            //     newGame: newGame
            // })
            const result = await gameCollection.insertOne(newGame);
            res.send(result);
        })




    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
