import express from 'express';
import postgresql from './postgresql.js';
import cors from 'cors';


const app = express();
app.use(express.json())
// Node js allow Access-Control-Allow-Origin for all domain
app.use(cors())

app.get('/books', async (req, res) => {
	postgresql(async (connection) => {
		const rows = await process.postgresql.query('SELECT * FROM books');
		res.status(200).send(JSON.stringify(rows));
	});
  
});

app.get('/create_home', async (req, res) => {
  postgresql(async (connection) => {
	  await connection.query('CREATE TABLE IF NOT EXISTS homes (id bigserial primary key, name text, description text, price NUMERIC, post_code text);');
	  //await connection.query('CREATE UNIQUE INDEX IF NOT EXISTS title ON books (title);');
/*
	  const books = [
		{ title: 'Mastering the Lightning Network', author: 'Andreas Antonopoulos' },
		{ title: 'Load Balancing with HAProxy', author: 'Nick Ramirez' },
		{ title: 'Silent Weapons for Quiet Wars', author: 'Unknown' },
	  ];

	  for (let i = 0; i < books.length; i += 1) {
		const book = books[i];
		await connection.query(`INSERT INTO books (title, author) VALUES ('${book.title}', '${book.author}') ON CONFLICT DO NOTHING;`);
	  }
	  */

	  console.log('PostgreSQL table homes seeded!');
  });
  res.status(200).send('create');
});



app.post('/home', async (req, res) => {
	console.log(req.body.name)
	console.log('post home! create new home')
	let req_json = req.body
	if (req_json.hasOwnProperty('name') && req_json.hasOwnProperty('desc')
		&& req_json.hasOwnProperty('price') && req_json.hasOwnProperty('post_code')){
		//
		try{
			postgresql(async (connection) => {
				await connection.query(`INSERT INTO homes (name, description, price, post_code) 
										VALUES ('${req_json.name}', '${req_json.desc}' , '${req_json.price}' , '${req_json.post_code}')
										ON CONFLICT DO NOTHING;`);
			});
		}catch (e) {
		  console.log("entering catch block");
		  console.log(e);
		  console.log("leaving catch block");
		  res.status(400).send(e);
		}
		
	} else {
		res.status(400).send('missing key');
	}
  
});

app.get('/home', async (req, res) => {
	//req.query.id
	try{
		//console.log(req.query.skip)
		//console.log(req.query.take)
		let offset_row = req.query.skip
		let limit_row = req.query.take
		postgresql(async (connection) => {
			const rows = await process.postgresql.query(`SELECT * FROM homes order by id asc limit ${limit_row} offset ${offset_row}`);
			//console.log(rows)
			let arr_home = {
				"payload": rows,
				'count': rows.length
			}
			res.status(200).json(arr_home)
		});
	}catch (e) {
		  console.log("entering catch block");
		  console.log(e);
		  console.log("leaving catch block");
		  res.status(500).send(e);
		}
});

app.patch('/home/:id', async (req, res) => {
	
	try{
		const id = req.params.id
		const changes = req.body;
		console.log(changes)
		postgresql(async (connection) => {
			const rows = await process.postgresql.query(`update homes set name = '${changes.name}', 
														description = '${changes.desc}', price = '${changes.price}',
														post_code = '${changes.post_code}'
														where id = ${id}`);
			//console.log(rows)
			let arr_home = {
				"payload": rows,
				'count': rows.length
			}
			res.status(200).json(arr_home)
		});
	}catch (e) {
		  console.log("entering catch block");
		  console.log(e);
		  console.log("leaving catch block");
		  res.status(500).send(e);
		}
});

app.get('/postCode', async (req, res) => {
	//req.query.id
	try{
		//console.log(req.query.skip)
		//console.log(req.query.take)
		let offset_row = req.query.skip
		let limit_row = req.query.take
		postgresql(async (connection) => {
			const rows = await process.postgresql.query(`SELECT post_code FROM homes`);
			//console.log(rows)
			let arr_home = {
				"payload": rows,
				'count': rows.length
			}
			res.status(200).json(arr_home)
		});
	}catch (e) {
		  console.log("entering catch block");
		  console.log(e);
		  console.log("leaving catch block");
		  res.status(500).send(e);
		}
});

app.get('/postCode/:id', async (req, res) => {
	const post_code = req.params.id
	console.log(post_code)
	try{
		//console.log(req.query.skip)
		//console.log(req.query.take)
		let offset_row = req.query.skip
		let limit_row = req.query.take
		postgresql(async (connection) => {
			const rows = await process.postgresql.query(`SELECT post_code, price FROM homes
											where post_code = '${post_code}'`);
			console.log(rows)
			let average = 0
			let median = 0
			let all_p = 0
			let arr_p = []
			for (const obj_row of rows){
				all_p += parseFloat(obj_row.price)
				arr_p.push(parseFloat(obj_row.price))
			}
			console.log('all_p: ', all_p)
			average = all_p/rows.length
			arr_p.sort(function(a, b){return a-b});// asc
			if (arr_p.length % 2 === 0){
				//
				let num_1 = arr_p[arr_p.length/2]
				let num_2 = arr_p[(arr_p.length/2)-1]
				median = (num_1 + num_2) / 2
			} else {
				median = arr_p[(arr_p.length-1)/2]
			}
			let arr_home = {
				"payload": {
					'average': average,
					'median': median
				}
			}
			console.log(arr_home)
			res.status(200).json(arr_home)
		});
	}catch (e) {
		  console.log("entering catch block");
		  console.log(e);
		  console.log("leaving catch block");
		  res.status(500).send(e);
	}
});

app.listen(8000, () => {
  console.log('App running at http://localhost:8000');
});

