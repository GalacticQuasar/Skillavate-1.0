import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 80;
const client = new MongoClient(process.env.mongoUrl);
const services_list = client.db("skillavate").collection("experimental_list");
const filter_options = client.db("skillavate").collection("filter_options");

async function getServices(pSkill, pPublic) {
	console.log(pSkill);
	let filter = {};

	if (pSkill != null) {
		if (typeof pSkill == "string") {
			if (pSkill == "All") {
				//Do not insert skill query, skillGroup is "All"
				console.log("ALL GROUPS");
			} else {
				filter.skill = pSkill;
				console.log("SPECIFIC SKILL");
			}
		} else {
			let orExpression = [];

			pSkill.forEach((skillName) => {
				orExpression.push({ skill: skillName });
			});

			filter.$or = orExpression;
			console.log("SKILL GROUP");
			console.log(orExpression);
		}
	}

	if (pPublic == null) {
		pPublic = "true";
	}

	filter.public = pPublic;

	console.log(filter);
	let list = await services_list.find(filter).toArray();
	return list;
}

async function getOptions() {
	let options = await filter_options.findOne({ _id: new ObjectId("64cc5b04e5ec108305168ff8") });

	delete options._id;

	//options = JSON.parse(JSON.stringify(options));

	return options;
}

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());

app.get("/", (req, res) => {
	res.render("home");
});

// API
app.post("/api/servicelist", async (req, res) => {
	res.send(await getServices(req.body.skill, req.body.public));
});

app.get("/api/filteroptions", async (req, res) => {
	res.send(await getOptions());
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
