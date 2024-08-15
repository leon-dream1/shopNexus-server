const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l574mko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productsCollection = client.db("shopNexus").collection("products");

    app.get("/", (req, res) => {
      res.send("Hello From Shop Nexus!!!!!!!!");
    });

    app.get("/products", async (req, res) => {
      console.log(req.query);
      const searchProductName = req?.query?.search;

      let query = {};

      if (searchProductName) {
        console.log("Search query is being used");
        query = {
          productName: { $regex: searchProductName, $options: "i" },
        };
      }

      const result = await productsCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
