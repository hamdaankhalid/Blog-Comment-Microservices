const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto')
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.use(cors());

const postsDb = {};

app.post('/posts/create', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;
    console.log(title);
    postsDb[id] = { id, title };

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    }).catch(err => console.log(err));


    res.status(201).send(postsDb[id]);
})

app.post('/events', (req, res) => {
    console.log('Received Event ', req.body.type);

    res.send({});
});

app.listen(4000, () => {
    console.log('Posts service server listening on 4000');
});
