const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).send({message: 'Unauthorized Access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err) {
            return res.status(401).send({message: 'Unauthorized Access'});
        }
        req.decoded = decoded;
        next();
    });
}

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

        // JWT api
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '5h'
            });
            res.send({token});
        });

        // post user by registration
        app.post('/api/registration', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // post user for login
        app.post('/api/login', async (req, res) => {
            const user = req.body;
            const query = {
                email: user.email,
                password: user.password
            };
            const users = await usersCollection.findOne(query);
            if(users !== null) {
                res.send({status: "exist"});
            } else {
                res.send({status: "not_exist"});
            }
        });

        // post billings details
        app.post('/api/add-billing', async (req, res) => {
            const billing = req.body;
            const result = await billingsCollection.insertOne(billing);
            res.send(result);
        });

        // read billings details
        app.get('/api/billing-list', async (req, res) => {
            const query = {};
            const sort = {_id: -1};
            const cursor = billingsCollection.find(query).sort(sort);
            const billings = await cursor.toArray();
            res.send(billings);
        });

        // read billings details by id
        app.get('/api/billing-id/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const billing = await billingsCollection.findOne(query);
            res.send(billing);
        });

        // search billings details
        app.get("/api/search/:key", async (req, res) => {
            const billing_id = req.params.key;
            const full_name = req.params.key;
            const email = req.params.key;
            const phone = req.params.key;
            const query = {
                "$or": [
                    {billing_id: {$regex: billing_id}},
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