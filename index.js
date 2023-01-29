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
        const billingsCollection = client.db('power-hack').collection('billings');

        // post user by registration
        app.post('/api/registration', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
            console.log('User added successfully...');
        });

        // read user for login
        app.get('/api/login', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
            console.log('User read successfully...');
        });

        // post billings details
        app.post('/api/add-billing', async (req, res) => {
            const billing = req.body;
            const result = await billingsCollection.insertOne(billing);
            res.send(result);
            console.log('Billing details added successfully...');
        });

        // read billings details
        app.get('/api/billing-list', async (req, res) => {
            const query = {};
            const cursor = billingsCollection.find(query);
            const billings = await cursor.toArray();
            res.send(billings);
            console.log('Billing details read successfully...');
        });

        // search billings details
        app.get("/api/search/:key", async (req, res) => {
            const full_name = req.params.key;
            const email = req.params.key;
            const phone = req.params.key;
            const query = {
                "$or": [
                    {full_name: {$regex: full_name}},
                    {email: {$regex: email}},
                    {phone: {$regex: phone}}
                ]
            };
            const billings = await billingsCollection.find(query).toArray();
            res.send(billings);
        });

        // update billing details
        app.put('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const billing = req.body;
            const option = {upsert: true};
            const updatedBilling = {
                $set: {
                    full_name: billing.full_name,
                    email: billing.email,
                    phone: billing.phone,
                    paid_amount: billing.paid_amount
                }
            };
            const result = await billingsCollection.updateOne(filter, updatedBilling, option);
            res.send(result);
            console.log('Billing details updated successfully...');
        });

        // delete billing details
        app.delete('/api/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await billingsCollection.deleteOne(query);
            res.send(result);
            console.log('Billing details deleted successfully...');
        });

    } catch(error) {
        console.log(error.message);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is working fine!!!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});