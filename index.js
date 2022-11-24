const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

// mirrawDB
// 2Kp6PXsbgCvTuNw4



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ksaovkw.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productsCollection = client.db("mirrawDb").collection("products");

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            let query = { categoryId: parseInt(id) };
            const results = await productsCollection.find(query).toArray();
            res.send(results)

        })

    }
    finally {
        // await client.close();
    }
}
run().catch(error => console.log(error));

















app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`My Server is running on port ${port}`)
})