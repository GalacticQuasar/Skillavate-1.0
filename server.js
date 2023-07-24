import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 80;
const client = new MongoClient(process.env.mongoUrl);
const services_list = client.db("skillavate").collection("services_list");

async function getServices() {
	let list = await services_list.find().toArray();
	list.forEach((elem) => {
		delete elem.description;
	});

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
	// 	`You entered:<br><br>Service Name: ${req.body.name}<br>Service Description: ${req.body.description}`
	// );
	// res.redirect(301, "/");

	if (
		typeof req.body.name != "string" ||
		typeof req.body.description != "string"
	) {
		res.send({ ok: false, message: "Invalid Data!", id: null });
		return;
	}

	await services_list
		.insertOne({
			name: req.body.name,
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

app.get("/service/:id", async (req, res) => {
	const service = await services_list.findOne({
		_id: new ObjectId(req.params.id),
	});

	res.render("viewService", {
		serviceName: service.name,
		serviceDescription: service.description,
	});
	//res.send(await services_list.findOne({ _id: new ObjectId(req.params.id) }));
});

app.listen(port, () => {
	console.log(`Skillavate App listening on port ${port}`);
});
