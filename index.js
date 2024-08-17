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
      const searchProductName = req?.query?.search;
      console.log(searchProductName);
      const page = parseInt(req?.query?.currentPage);
      const size = parseInt(req?.query?.productPerPage);
      const sort = req?.query?.sort;
      const brand = req?.query?.selectedBrand;
      const category = req?.query?.selectedCategory;
      const minPrice = parseInt(req?.query?.minPrice);
      const maxPrice = parseInt(req?.query?.maxPrice);
      console.log("price", minPrice, maxPrice); // 401 500

      let query = {};
      let sortQuery = {};

      if (searchProductName) {
        console.log("Search query is being used");
        query = {
          productName: { $regex: searchProductName, $options: "i" },
        };
      }

      if (sort === "asc") {
        sortQuery = { price: 1 };
      } else if (sort === "desc") {
        sortQuery = { price: -1 };
      } else if (sort === "newest") {
        sortQuery = { creationDateTime: -1 };
      }

      //filter by brand and category
      if (brand && brand !== "All") {
        query.brandName = { $regex: brand, $options: "i" };
      }

      if (category && category !== "All") {
        query.category = { $regex: category, $options: "i" };
      }

      // if (minPrice !== "null" && maxPrice !== "null") {
      //   query.price = { $gte: minPrice, $lte: maxPrice };
      // }

      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      }

      const result = await productsCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .sort(sortQuery)
        .toArray();
      console.log("paisi", result.length);
      res.send(result);
    });

    app.get("/totalProducts", async (req, res) => {
      const result = await productsCollection.estimatedDocumentCount();
      res.send({ count: result });
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
