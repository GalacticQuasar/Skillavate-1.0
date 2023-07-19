import express from "express"
import { MongoClient } from 'mongodb'
const app = express()
const port = 80
const client = new MongoClient("mongodb+srv://GalacticQuasar:averagejonas@skillavate.8ano7db.mongodb.net/?retryWrites=true&w=majority")

async function getServices() {
  //Check Connection
  await client.db("admin").command({ ping: 1 })
  console.log("Pinged your deployment. You successfully connected to MongoDB!")
  
  const services_list = client.db("skillavate").collection("services_list")
  console.log()

  await client.close()
}
run().catch(console.dir)

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('home')
})

app.post('/', (req, res) => {
    console.log(req.body.content)
    res.send(`You typed: ${req.body.content}<br><br>Sent data: ${JSON.stringify(req.body)}`)
})

app.listen(port, () => {
    console.log(`Skillavate App listening on port ${port}`)
})