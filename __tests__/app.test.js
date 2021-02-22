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

    test('returns characters', async() => {

      const expectation = [
        {
          id:1,
          owner_id:1,
          name: 'mario',
          good_guy: true,
          image_url: 'https://www.mariowiki.com/images/c/cf/SMB_Super_Mario_Sprite.png',
          age: 45,
          category: 'hero',
          quote: 'It\'s a-me, Mario!'
        },
        {
          id: 2,
          owner_id: 1,
          name: 'luigi',
          good_guy: true,
          image_url: 'https://www.mariowiki.com/images/b/b7/SMB_Super_Luigi_Sprite.png',
          age: 43,
          category: 'hero',
          quote: 'Luigi time!'
        },
        {
          id: 3,
          owner_id: 1,
          name: 'princess toadstool',
          good_guy: true,
          image_url: 'https://www.mariowiki.com/images/c/c0/SMB_Princess_Toadstool_Sprite.png',
          age: 40,
          category: 'damsel',
          quote: 'Oh, no... oh.'
        },
        {
          id: 4,
          owner_id: 1,
          name: 'goomba',
          good_guy: false,
          image_url: 'https://www.mariowiki.com/images/4/4e/SMB_Goomba_Sprite.gif',
          age: 0,
          category: 'enemy',
          quote: 'N/A'
        },
        {
          id: 5,
          owner_id: 1,
          name: 'bullet bill',
          good_guy: false,
          image_url: 'https://www.mariowiki.com/images/e/ec/Bullet_Bill_Super_Mario_Bros.png',
          age: 0,
          category: 'enemy',
          quote: 'N/A'
        },
        {
          id: 6,
          owner_id: 1,
          name: 'bowser',
          good_guy: false,
          image_url: 'https://www.mariowiki.com/images/3/31/SMB_Bowser_Walking_Sprite.gif',
          age: 50,
          category: 'boss',
          quote: 'Mario! Prepare yourself for the great beyond!'
        }
      ];

      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns characters by category', async() => {

      const expectation = [
        {
          id:1,
          owner_id:1,
          name: 'mario',
          good_guy: true,
          image_url: 'https://www.mariowiki.com/images/c/cf/SMB_Super_Mario_Sprite.png',
          age: 45,
          category: 'hero',
          quote: 'It\'s a-me, Mario!'
        },
        {
          id: 2,
          owner_id: 1,
          name: 'luigi',
          good_guy: true,
          image_url: 'https://www.mariowiki.com/images/b/b7/SMB_Super_Luigi_Sprite.png',
          age: 43,
          category: 'hero',
          quote: 'Luigi time!'
        },
      ];

      const data = await fakeRequest(app)
        .get('/categories/hero')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns specific character by name', async() => {

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

    test('returns characters', async() => {

      const expectation =
        {
          id:7,
          owner_id:1,
          name: 'waluigi',
          good_guy: false,
          image_url: 'https://www.mariowiki.com/images/thumb/3/3f/Mario_Party_-_Island_Tour_Waluigi_Artwork.png/170px-Mario_Party_-_Island_Tour_Waluigi_Artwork.png',
          age: 45,
          category: 'villian',
          quote: 'I"M NUMBER ONE! Heh, hehehehe! Look, I\'ma dance, I\'ma Sing, I\'ma so Happy! HA, hahahahaha!...Heh? Grrrrrrrrrrrrr!'
        };
      
      await fakeRequest(app)
        .post('/characters')
        .expect('Content-Type', /json/)
        .expect(200);
        
      const data = await fakeRequest(app)
        .get('/characters')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.find(character => character.name === expectation.name)).toEqual(expectation);
    });
  });
});
