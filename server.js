import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 80;
const client = new MongoClient(process.env.mongoUrl);
const services_list = client.db("skillavate").collection("experimental_list");
const filter_options = client.db("skillavate").collection("filter_options");
const skill_requests = client.db("skillavate").collection("skill_requests");

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data

async function getServices(pSkill, pPublic) {
	let filter = {};

	if (pSkill != null) {
		if (typeof pSkill == "string") {
			if (pSkill == "All") {
				//Do not insert skill query, skillGroup is "All"
			} else {
				filter.skill = pSkill;
			}
		} else {
			let orExpression = [];

			pSkill.forEach((skillName) => {
				orExpression.push({ skill: skillName });
			});

			filter.$or = orExpression;
		}
	}

	if (pPublic == null) {
		pPublic = "true";
	}

	filter.public = pPublic;
	let list = await services_list.find(filter).toArray();
	return list;
}

async function getOwnServices(tutorID) {
	let filter = {};

	filter.tutorID = tutorID;
	const skill_requests = client.db("skillavate").collection("skill_requests");
	let list = await services_list.find(filter).toArray();
	return list;
}

async function getOptions() {
	let options = await filter_options.findOne({ _id: new ObjectId("64cc5b04e5ec108305168ff8") });

	delete options._id;

	return options;
}

// API
app.post("/api/servicelist", async (req, res) => {
	res.send(await getServices(req.body.skill, req.body.public));
});

app.post("/api/ownservicelist", async (req, res) => {
	res.send(await getOwnServices(req.body.tutorID));
});

app.get("/api/filteroptions", async (req, res) => {
	res.send(await getOptions());
});

app.post("/api/addService", async (req, res) => {
	let info = req.body;
	let document = await services_list.insertOne({
		title: info.title,
		description: info.description,
		location: info.location,
		skill: info.skill,
		phone: info.phone,
		email: info.email,
		website: info.website,
		photoURL: info.photo,
		public: "true", //default
	});

	if (info.suggest != null) {
		skill_requests.insertOne({
			request: info.suggest,
			serviceID: document.insertedId,
		});
	}

	res.redirect("/");
});

app.post("/api/updateService", (req, res) => {
	let info = req.body;

	services_list.updateOne(
		{
			_id: new ObjectId(info.serviceID),
		},
		{
			$set: {
				title: info.title,
				description: info.description,
				location: info.location,
				phone: info.phone,
				email: info.email,
				website: info.website,
				photoURL: info.photo,
				public: info.validateCheck,
			},
		}
	);
	res.redirect("/tutorDash");
});

// HOME PAGE
app.get("/", (req, res) => {
	res.render("home");
});

// SERVICES PAGE
app.get("/services", (req, res) => {
	res.render("services");
});

// VIEW SERVICE PAGE
app.get("/service/:id", async (req, res) => {
	const service = await services_list.findOne({
		_id: new ObjectId(req.params.id),
	});

	res.render("viewService", {
		serviceTitle: service.title,
		serviceDescription: service.description,
		servicePhone: service.phone,
		serviceEmail: service.email,
		serviceWebsite: service.website,
		serviceLocation: service.location,
	});
});
/*
// TUTOR DASHBOARD PAGE
app.get("/TutorDash", (req, res) => {
	res.render("tutorDash");
});

app.get("/tutorDash/editService/:id", async (req, res) => {
	const service = await services_list.findOne({
		_id: new ObjectId(req.params.id),
	});

	res.render("editService", {
		serviceID: service._id,
		serviceTitle: service.title,
		serviceDescription: service.description,
		serviceZipcode: service.location,
		servicePhone: service.phone,
		serviceEmail: service.email,
		serviceWebsite: service.website,
		servicePhoto: service.photoURL,
		servicePublic: service.public,
	});
});*/

// ADD SERVICES PAGE
app.get("/addService", (req, res) => {
	res.render("addService");
});
/*
// SIGN UP PAGE
app.get("/signup", (req, res) => {
	res.render("signup");
});

// LOG IN PAGE
app.get("/login", (req, res) => {
	res.render("login");
});
*/
app.listen(port, () => {
	console.log(`Skillavate App listening on port ${port}`);
});
