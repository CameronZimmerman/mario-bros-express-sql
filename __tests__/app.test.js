require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns animals', async() => {

      const expectation = 
        {
          id: 2,
          owner_id: 1,
          name: 'luigi',
          good_guy: true,
          image_url: 'https://www.mariowiki.com/images/b/b7/SMB_Super_Luigi_Sprite.png',
          age: 43,
          category: 'hero',
          quote: 'Luigi time!'
        };

      const data = await fakeRequest(app)
        .get('/characters/luigi')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
