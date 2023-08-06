import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 80;
const client = new MongoClient(process.env.mongoUrl);
const services_list = client.db("skillavate").collection("services_list");
const skill_requests = client.db("skillavate").collection("skill_requests");
app.use(express.urlencoded({ extended: true })) // for form data
async function getServices() {
	let list = await services_list.find().toArray();
	return list;
}

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());

app.get("/", (req, res) => {
	res.render("home");
});

app.post("/", async (req, res) => {
	console.log(req.body);
	// res.send(
	// 	`You entered:<br><br>Service Title: ${req.body.title}<br>Service Description: ${req.body.description}`
	// );
	// res.redirect(301, "/");

	if (typeof req.body.title != "string" || typeof req.body.description != "string") {
		res.send({ ok: false, message: "Invalid Data!", id: null });
		return;
	}

	await services_list
		.insertOne({
			title: req.body.title,
			description: req.body.description,
		})
		.then((response) => {
			res.send({
				ok: true,
				message: "Successfully Added Your Service!!!!!",
				id: response.insertedId.toString(),
			});
		})
		.catch((err) => {
			console.error(err);
			res.send({ ok: false, message: "", id: null });
			return null;
		});
});

app.get("/api/servicelist", async (req, res) => {
	res.send(await getServices());
});
app.get("/addService", (req, res) => {
	res.render("addService");
});
app.post("/addService/submit", (req, res) => {
	let info= req.body; 
	services_list.insertOne({title: info.title, description: info.description, location: info.location, skillgroup: info.skillgroup, skill: info.skill, phone:info.phone,email:info.email,website:info.website, photoURL:info.photo, public: "true"})

	res.redirect("/")
});
app.post("/addService/request", (req, res) => {
	let info= req.body; 
	skill_requests.insertOne({request: info.suggest})
	res.redirect("/addService")
});
app.get("/service/:id", async (req, res) => {
	const service = await services_list.findOne({
		_id: new ObjectId(req.params.id),
	});

	res.render("viewService", {
		serviceTitle: service.title,
		serviceDescription: service.description,
	});
	//res.send(await services_list.findOne({ _id: new ObjectId(req.params.id) }));
});

app.get("/services", (req, res) => {
	res.render("services");
});

app.listen(port, () => {
	console.log(`Skillavate App listening on port ${port}`);
});
