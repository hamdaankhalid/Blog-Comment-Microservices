const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto')
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    res.send(commentsByPostId[postId] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({ id: id, content, status: 'pending' });
    
    commentsByPostId[req.params.id] = comments;

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: id,
            content,
            status: 'pending',
            postId: req.params.id
        }
    });

    res.status(201).send(commentsByPostId[req.params.id]);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentModerated'){
        const { postId, id, status, content } = data;
        const comments = commentsByPostId[postId]
        console.log('COMMENTS', comments, id);
        const comment = comments.find(com => {
            return com.id === id;
        });
        comment.status = status;

        axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content,
            }
        }).catch(err => console.log(err));

    }
    res.send({});
});

app.listen(4001, () => {
    console.log('Comments service server listening on 4001');
}); 
