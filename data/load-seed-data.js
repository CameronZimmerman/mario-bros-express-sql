const client = require('../lib/client');
// import our seed data:
const characters = require('./characters.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];
    
    await Promise.all(
      categoriesData.map(category => {
        return client.query(`
                      INSERT INTO categories (category_name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [category.category_name]);
      })
    );
    
    await Promise.all(
      characters.map(character => {
        return client.query(`
                    INSERT INTO characters (name, good_guy, image_url, age, category_id, quote, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [character.name, character.good_guy, character.image_url, character.age, character.category_id, character.quote, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
