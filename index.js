const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const jwt = require("jsonwebtoken");
const { sign } = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

// mirrawDB
// 2Kp6PXsbgCvTuNw4



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ksaovkw.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const verifyJwt = (req, res, next) => {
    const autHorization = req.headers.authorization

    if (!autHorization) {
        res.status(401).send('Unauthenticated access denied')
    };

    const token = autHorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            res.status(403).send('something wrong')
        }
        req.decoded = decoded;
        next()
    })
};

async function run() {
    try {
        const productsCollection = client.db("mirrawDb").collection("products");
        const bookingsCollection = client.db("mirrawDb").collection("bookings");
        const categoryCollection = client.db("mirrawDb").collection("category");
        const usersCollection = client.db("mirrawDb").collection("users");
        const sellerProductsCollection = client.db("mirrawDb").collection("SellerProducts");
        const advertisedProductsCollection = client.db("mirrawDb").collection("advertised");


        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
            res.send({ token });
        });


        app.get('/category', async (req, res) => {
            const query = {};
            const result = await categoryCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            let query = { categoryId: parseInt(id) };
            const results = await productsCollection.find(query).toArray();
            res.send(results)
        });


        app.put('/report/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    report: 'Reported'
                },
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

        app.put('/reportseller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    reportedSeller: 'ReportedSeller'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });



        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);

        });

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const results = await bookingsCollection.find(query).toArray();
            res.send(results);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query)
            res.send(result);
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);
        });


        app.get('/users', verifyJwt, async (req, res) => {
            const decodedEmail = req.decoded.email;
            if (decodedEmail !== req.query.email) {
                res.status(401).send('theft access');
            };
            const query = { email: decodedEmail };
            const results = await usersCollection.findOne(query);
            res.send(results);
        });


        app.post('/myProducts', async (req, res) => {
            const ProductInfo = req.body;
            const result = await sellerProductsCollection.insertOne(ProductInfo);
            res.send(result);
        })


        app.get('/myProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const results = await sellerProductsCollection.find(query).toArray();
            res.send(results);
        });

        app.delete('/myProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await sellerProductsCollection.deleteOne(query)
            res.send(result);

        })


        app.post('/advertised', async (req, res) => {
            const Product = req.body;
            const result = await advertisedProductsCollection.insertOne(Product);
            res.send(result);
        });

        app.get('/advertised', async (req, res) => {
            const query = {};
            const result = await advertisedProductsCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/seller', async (req, res) => {
            const query = { userType: "Buyer" };
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        });

        app.delete('/seller/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            console.log(result);
            res.send(result);

        })


        app.get('/buyer', async (req, res) => {
            const query = { userType: "Seller" };
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })
        app.delete('/buyer/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query)
            console.log(result);
            res.send(result);


        })


        app.get('/reportedProducts', async (req, res) => {
            const query = { report: 'Reported' };
            const result = await productsCollection.find(query).toArray();
            console.log(result);
            res.send(result);

        });

        app.delete('/reportedProducts/id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
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