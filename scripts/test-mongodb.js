const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://127.0.0.1:27017/taskflow';

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const database = client.db();
    console.log(`Connected to database: ${database.databaseName}`);
    
    // List all collections
    const collections = await database.listCollections().toArray();
    console.log('Collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count users
    const usersCount = await database.collection('users').countDocuments();
    console.log(`Number of users: ${usersCount}`);
    
    // Count tasks
    const tasksCount = await database.collection('tasks').countDocuments();
    console.log(`Number of tasks: ${tasksCount}`);
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection(); 