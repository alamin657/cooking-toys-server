const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json())
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ovac2y.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const toysCollection = client.db('toysCooking').collection('toys');
        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find().limit(20)
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const result = await toysCollection.findOne(query);
            res.send(result);
        })
        app.get('/shopByCategory/:category', async (req, res) => {
            const toys = req.params.category;
            const query = { SubCategory: toys }
            const shopcategory = await toysCollection.find(query).toArray();
            res.send(shopcategory)
        })

        app.get('/mytoys/:email', async (req, res) => {
            const filter = req.params.email;
            const query = { SellerEmail: filter };
            const mytoysCategory = await toysCollection.find(query).toArray()
                .sort({ Price: -1 })
            res.send(mytoysCategory);
        })

        app.get('/cookingToysByText/:text', async (req, res) => {
            const text = req.params.text;
            const result = await toysCollection.find({
                $or: [
                    { Seller: { $regex: text, $options: 'i' } },

                ],
            }).toArray();
            res.send(result)
        })
        app.post('/toys', async (req, res) => {
            const cooking = req.body;
            const result = await toysCollection.insertOne(cooking);
            res.send(result);
        })

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateToys = req.body;
            console.log(updateToys);
            const updateDoc = {
                $set: {
                    Price: updateToys.Price,
                    AvailableQuantity: updateToys.AvailableQuantity,
                    DetailDescription: updateToys.DetailDescription
                }
            }
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Cooking toys is running')
})

app.listen(port, () => {
    console.log(`Cooking toys is running on port:${port}`)
})