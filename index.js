const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');


const app = express();
const PORT = 3000;

const lists = require('./data/lists.json');

app.use(express.json());
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
	  extended: true,
	}),
  );
app.use(cors({ origin: '*' }));

app.options('/lists/add', function (req, res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader("Access-Control-Allow-Headers", "*");
	res.end();
  });
  
// Dohvati podatke o svim korisnicima
app.get('/users', (req, res) => {
	fs.readFile('./data/users.json', (error, data) => {
		if (error) {
			console.log(error);
			res.status(404);
			res.json({});
		}
		res.status(200);
		res.json(JSON.parse(data));
	})
})

// Dohvati liste određenog korisnika
app.get('/user/:id/lists', (req, res) => {
	const userId = parseInt(req.params.id);
	const filteredLists = lists.filter((list) => list.userId == userId);
	console.log(`GET user ${userId} lists`);
	res.status(200).json(filteredLists);
})

// Dohvati specifične liste po imenu
app.get('/user/:id/lists/want_to_read', (req, res) => {
	const userId = parseInt(req.params.id);
	const filteredLists = lists.filter((list) => list.userId == userId);
	const toReadList = filteredLists.find((list) => list.name === "Want To Read")
	console.log(`GET user ${userId} Want To Read`);
	res.status(200).json(toReadList);
})
app.get('/user/:id/lists/done_reading', (req, res) => {
	const userId = parseInt(req.params.id);
	const filteredLists = lists.filter((list) => list.userId == userId);
	const toReadList = filteredLists.find((list) => list.name === "Done Reading")
	console.log(`GET user ${userId} Done Reading`);
	res.status(200).json(toReadList);
})

// Postavi određenu knjigu u odabrane liste
app.put('/lists/add', (req, res) => {

	const { userId, selectedListsIds, olid } = req.body;
	
	for (const list of lists) {
		if (list.userId == userId) {
			if (selectedListsIds.includes(list.id)) {
				if (!list.booksOlid.includes(olid)) list.booksOlid.push(olid);
			}
			else {
				list.booksOlid = list.booksOlid.filter((o) => o != olid);
			}
		}
	}

	fs.writeFile('./data/lists.json', JSON.stringify(lists, null, 4), (err) => {
		if (err) {
			console.log(err);
			res.status(404).send("Error while trying to open /data/lists.json");
		}
	})

	console.log(`PUT updating user ${userId} lists for book ${olid}`);
	res.status(200);
	res.send("Wow");
})

// Ukloni knjigu s liste
app.put('/remove/book', (req, res) => {

	const { userId, listId, bookOlid } = req.body;

	const userLists = lists.filter(list => list.userId === userId);
	const list = userLists.find(list => list.id === listId);
	list.booksOlid = list.booksOlid.filter(olid => olid != bookOlid);

	fs.writeFile('./data/lists.json', JSON.stringify(lists, null, 4), (err) => {
		if (err) {
			console.log(err);
			res.status(404).send("Error while trying to open /data/lists.json");
		}
	})

	console.log(`PUT updating user ${userId} list ${listId} (removed book ${bookOlid})`);
	res.status(200);
	res.send("Wow");
})

app.listen(PORT, (error) => {
	if (error) {
		console.log("Error occurred, server can't start", error);
	}
	else {
		console.log("Server is successfully running.\nApp is listening on port " + PORT);
	}
})