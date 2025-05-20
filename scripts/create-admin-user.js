const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Connection URI
const uri = 'mongodb://127.0.0.1:27017/taskflow';

async function createAdminUser() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    const users = database.collection('users');
    
    // Check if admin user exists
    const existingAdmin = await users.findOne({ email: 'admin@taskflow.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await users.insertOne(adminUser);
    console.log(`Admin user created with ID: ${result.insertedId}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser(); 