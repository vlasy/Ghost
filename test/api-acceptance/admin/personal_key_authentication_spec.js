const should = require('should');
const supertest = require('supertest');
const _ = require('lodash');
const testUtils = require('../../utils');
const config = require('../../../core/shared/config');
const localUtils = require('./utils');

const ghost = testUtils.startGhost;

describe('Personal API key authentication', function () {
    let request;
    let myApiKey;
    let user;
    let createUser;

    before(function () {
        return ghost()
            .then(function () {
                request = supertest.agent(config.get('url'));
            })
            .then(function () {
                createUser = {...testUtils.DataGenerator.forKnex.createUser({email: 'test+3@ghost.org'}), personal_api_key: {type: 'personal'}};
                return testUtils.createUser({
                    user: createUser,
                    role: testUtils.DataGenerator.Content.roles[2].name
                });
            })
            .then(function (_user) {
                user = _user;
                request.user = createUser;
                return localUtils.doAuth(request);
            })
            .then(function () {
                return request.get(localUtils.API.getApiQuery('users/me/?include=personal_api_key')).set('Origin', config.get('url'));
            })
            .then(function (res) {
                myApiKey = res.body.users[0].personal_api_key;
                request = supertest.agent(config.get('url')); // I was unable to clear the session, so this ugly solution
            });
    });

    it('Can not access endpoint without a token header', function () {
        return request.get(localUtils.API.getApiQuery('posts/'))
            .set('Authorization', `Ghost`)
            .expect('Content-Type', /json/)
            .expect('Cache-Control', testUtils.cacheRules.private)
            .expect(401);
    });

    it('Can not access endpoint with a wrong endpoint token', function () {
        return request.get(localUtils.API.getApiQuery('posts/'))
            .set('Authorization', `Ghost ${localUtils.getValidPersonalToken(myApiKey.id, myApiKey.secret, 'https://wrong.com')}`)
            .expect('Content-Type', /json/)
            .expect('Cache-Control', testUtils.cacheRules.private)
            .expect(401);
    });

    it('Can access browse endpoint with correct token', function () {
        return request.get(localUtils.API.getApiQuery('posts/'))
            .set('Authorization', `Ghost ${localUtils.getValidPersonalToken(myApiKey.id, myApiKey.secret, '/canary/admin/')}`)
            .expect('Content-Type', /json/)
            .expect('Cache-Control', testUtils.cacheRules.private)
            .expect(200);
    });

    it('Can create post', function () {
        const post = {
            title: 'Post created with personal_api_key'
        };

        return request
            .post(localUtils.API.getApiQuery('posts/?include=authors'))
            .set('Origin', config.get('url'))
            .set('Authorization', `Ghost ${localUtils.getValidPersonalToken(myApiKey.id, myApiKey.secret, '/canary/admin/')}`)
            .send({
                posts: [post]
            })
            .expect('Content-Type', /json/)
            .expect('Cache-Control', testUtils.cacheRules.private)
            .expect(201)
            .then((res) => {
                res.body.posts[0].authors.length.should.eql(1);
                res.body.posts[0].title.should.eql(post.title);
            });
    });

    // TODO: can create post when owner! there's a bug

    it('Can read users', function () {
        return request
            .get(localUtils.API.getApiQuery('users/'))
            .set('Origin', config.get('url'))
            .set('Authorization', `Ghost ${localUtils.getValidPersonalToken(myApiKey.id, myApiKey.secret, '/canary/admin/')}`)
            .expect('Content-Type', /json/)
            .expect('Cache-Control', testUtils.cacheRules.private)
            .expect(200)
            .then((res) => {
                localUtils.API.checkResponse(res.body.users[0], 'user');
            });
    });
});
