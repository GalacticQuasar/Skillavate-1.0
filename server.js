import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 80;
const client = new MongoClient(process.env.mongoUrl);

async function getServices() {
  //Check Connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  const services_list = client.db("skillavate").collection("services_list");
  return await services_list.find().toArray();
}
getServices().catch(console.error);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/", (req, res) => {
  console.log(req.body.content);
  res.send(
    `You typed: ${req.body.content}<br><br>Sent data: ${JSON.stringify(
      req.body
    )}`
  );
});

app.get("/api/servicelist", async (req, res) => {
  res.send(await getServices());
});

app.listen(port, () => {
  console.log(`Skillavate App listening on port ${port}`);
});
