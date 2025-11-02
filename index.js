const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection url With configuration (userName: smart_deals_db and password: Hz6iHEFjvXr6f1pv)
const uri =
  'mongodb+srv://smart_deals_db:Hz6iHEFjvXr6f1pv@cluster0.daqctd4.mongodb.net/?appName=Cluster0';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Smart Server is Running');
});

// process one to connect the server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // created database
    const db = client.db('smart_db');
    const productsCollection = db.collection('products');
    const bidsCollection = db.collection('bids');
    const userCollection = db.collection('user_db');

    // get all added products from database
    app.get('/products', async (req, res) => {
      // findAll product
      //   const cursor = productsCollection.find();

      // find Product as sorting
      //   const cursor = productsCollection.find().sort({ price_min: 1 });

      // limit data
      //   const cursor = productsCollection.find().sort({ price_min: 1 }).limit(1);

      // akta data theke sb kichu hide kore kichu akta dekhanu
      //   const cursor = productsCollection.find().sort({ price_min: 1 }).limit(1);

      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = productsCollection.find(query);

      const result = await cursor.toArray();
      res.send(result);
    });

    // get single a product from database
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // get latest product
    app.get('/latest-products', async (req, res) => {
      const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // add products to database
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // update data in database
    app.patch('/products/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const options = {};
      const result = await productsCollection.updateOne(query, update, options);
      res.send(result);
    });

    // delete single product from database
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // bids collection
    app.get('/bids', async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/bids', async (req, res) => {
      const newBids = req.body;
      const result = await bidsCollection.insertOne(newBids);
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const newUser = req.body;

      // check email for do not duplicator
      const email = req.body.email;
      const query = { email: email };
      const existingUser = userCollection.findOne(query);
      if (existingUser) {
        res.send({ message: 'User already exist' });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ Ping: 1 });
    console.log('DataBase connection successfully');
  } finally {
    // I don't want to close this connection
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log('Smart Server is Running at', port);
});

// second process to connect the server
// client
//   .connect()
//   .then(() => {
//     app.listen(port, () => {
//       console.log('Smart Server is Running on port', port);
//     });
//   })
//   .catch(console.dir);
