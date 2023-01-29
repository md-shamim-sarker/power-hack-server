const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.egsefuu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        const usersCollection = client.db('power-hack').collection('users');

        // post user by registration
        app.post('/api/registration', async (req, res) => {
            const user = req.body;
            const result = await collection.insertOne(user);
            res.send(result);
            console.log('Data added successfully...');
        });

        // read user for login
        app.get('/api/login', async (req, res) => {
            const query = {};
            const cursor = collection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });

        // // R from CRUD (find by id)
        // app.get('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const user = await collection.findOne(query);
        //     res.send(user);
        // });

        // // R from CRUD (using query parameters)
        // // http://localhost:5000/usrs?firstName=Shamim (query parameter format)
        // app.get('/usrs', async (req, res) => {
        //     let query = {};
        //     if(req.query.firstName) {
        //         query = {
        //             firstName: req.query.firstName
        //         };
        //     }
        //     const cursor = collection.find(query);
        //     const usrs = await cursor.toArray();
        //     res.send(usrs);
        // });

        // // U from CRUD
        // app.put('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = {_id: ObjectId(id)};
        //     const user = req.body;
        //     const option = {upsert: true};
        //     const updatedUser = {
        //         $set: {
        //             firstName: user.firstName,
        //             lastName: user.lastName
        //         }
        //     };
        //     const result = await collection.updateOne(filter, updatedUser, option);
        //     res.send(result);
        // });

        // // D from CRUD
        // app.delete('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const result = await collection.deleteOne(query);
        //     res.send(result);
        // });

    } catch(error) {
        console.log(error.message);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is working fine!!!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});