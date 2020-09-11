/* eslint-disable no-console */
// Create a token without the client
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Personal API key goes here
const key = '5f5b4e5968813da5c6b6e6ef:6349cc5e46ea56b9256d4e6ee3b50ab544cc8321d8ef192287271e473830d8aa';

// Split the key into ID and SECRET
const [id, secret] = key.split(':');

// Create the token (including decoding secret)
const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: `/v3/admin/`
});

// Make an authenticated request to create a post
const url = 'http://localhost:2368/ghost/api/v3/admin/posts/';

const headers = {Authorization: `Ghost ${token}`};
const payload = {posts: [{title: `Hello World from token ${secret}`}]};
axios.post(url, payload, {headers})
    .then(response => console.log(response.body))
    .catch(error => console.error(error.toJSON()));
