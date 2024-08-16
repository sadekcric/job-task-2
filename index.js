const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("server is Running");
  res.send("Server is Running");
});

// Mongodb database started

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.1ekltq6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("SCIC-job-task-2").collection("products");

    app.get("/products", async (req, res) => {
      try {
        const pages = parseInt(req.query.pages);
        const size = parseInt(req.query.size);
        const { sortPrice, sortDate } = req.query;

        const query = {};
        const option = {
          sort: {
            Price: sortPrice === "asc" ? 1 : -1,
            CreationDate: sortDate === "asc" ? 1 : -1,
          },
        };

        const productCount = await productCollection.estimatedDocumentCount();

        const data = await productCollection
          .find(query, option)
          .skip(pages * size)
          .limit(size)
          .toArray();
        res.status(200).send({ allProduct: data, allProductLength: productCount });
      } catch (error) {
        res.status(404).send(error.message);
      }
    });

    app.get("/search", async (req, res) => {
      const { query } = req.query;

      if (!query) {
        res.status(404).send({ message: "Search Query not Required" });
      }

      try {
        const filter = {
          ProductName: { $regex: query, $options: "i" },
        };
        const searchingData = await productCollection.find(filter).toArray();

        res.status(200).send(searchingData);
      } catch (error) {
        res.status(404).send(error.message);
      }
    });

    app.get("/search-category", async (req, res) => {
      const { category, min, max } = req.query;
      const query = {
        Category: { $regex: category, $options: "i" }, // Case-insensitive
        Price: { $gt: parseInt(min), $lt: parseInt(max) },
      };

      const data = await productCollection.find(query).toArray();
      res.status(200).send(data);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(query);

      res.status(200).send(product);
    });
  } finally {
  }
}
run().catch(console.dir);

// Mongodb database ended

app.listen(port, () => {
  console.log(`Port is running at: ${port}`);
});
