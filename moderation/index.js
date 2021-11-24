const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    // any time we see a type of event comment created we start moderation on it and eventually emit
    // comment moderated

    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';
        
        axios.post('http://event-bus-srv:4005/events',{
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        }).catch(err => console.log(err));
    }
});

app.listen(4003, () => {
    console.log('Moderation service listening on 4003');
});
