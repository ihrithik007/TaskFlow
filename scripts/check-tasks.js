const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://127.0.0.1:27017/taskflow';

async function checkAndCreateTask() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    const tasks = database.collection('tasks');
    const users = database.collection('users');
    
    // Find admin user
    const adminUser = await users.findOne({ email: 'admin@taskflow.com' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log(`Found admin user with ID: ${adminUser._id}`);
    
    // Check existing tasks
    const existingTasks = await tasks.find({}).toArray();
    
    if (existingTasks.length === 0) {
      console.log('No tasks found. Creating a sample task...');
      
      try {
        // Create a sample task
        const sampleTask = {
          title: 'Sample Task',
          description: 'This is a sample task created for testing.',
          status: 'todo',
          priority: 'medium',
          createdBy: new ObjectId(adminUser._id),
          assignedTo: new ObjectId(adminUser._id),
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Sample task object:', JSON.stringify(sampleTask, null, 2));
        
        const result = await tasks.insertOne(sampleTask);
        console.log(`Sample task created with ID: ${result.insertedId}`);
      } catch (insertError) {
        console.error('Error creating sample task:', insertError);
      }
    } else {
      console.log(`Found ${existingTasks.length} tasks:`);
      existingTasks.forEach((task, index) => {
        console.log(`\nTask ${index + 1}:`);
        console.log(`ID: ${task._id}`);
        console.log(`Title: ${task.title}`);
        console.log(`Status: ${task.status}`);
        console.log(`Created by: ${task.createdBy}`);
        console.log(`Assigned to: ${task.assignedTo || 'Not assigned'}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking tasks:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

checkAndCreateTask(); 