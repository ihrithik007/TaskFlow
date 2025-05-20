const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://127.0.0.1:27017/taskflow';

async function checkUsers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    const users = database.collection('users');
    
    // Get all users
    const allUsers = await users.find({}).toArray();
    
    if (allUsers.length === 0) {
      console.log('No users found in the database');
    } else {
      console.log(`Found ${allUsers.length} users:`);
      allUsers.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`ID: ${user._id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role || 'unknown'}`);
        console.log(`Password exists: ${user.password ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

checkUsers(); 