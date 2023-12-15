
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const uri = "mongodb+srv://Nasimbano:Nasimbano1245@cluster1.u69znhq.mongodb.net/?retryWrites=true&w=majority";



// MongoDB Connection
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'louve-paris',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

// Connect to MongoDB once and reuse the connection
client.connect(err => {
    if (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    }
    console.log('Connected to MongoDB');
});

// Helper function to get DB
function getDb() {
    return client.db('FinanceTrackerApp');
}

// GET route for fetching expenses
app.get('/getExpenses', async (req, res) => {
  if (!req.session.username) {
      return res.status(401).send('Unauthorized - User not logged in');
  }

  try {
      const db = getDb();
      const collection = db.collection('expenses');

      const expenses = await collection.find({ username: req.session.username }).toArray();
      res.json(expenses);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving expenses');
  }
});


// POST route for adding a new expense
app.post('/addExpense', async (req, res) => {
  if (!req.session.username) {
      return res.status(401).send('Unauthorized - User not logged in');
  }

  try {
      const db = getDb();
      let expenseDocument = {
          "username": req.session.username, // Linking expense to the user
          "date": new Date(req.body.date),
          "amount": req.body.amount,
          "category": req.body.category
      };

      const col = db.collection('expenses');
      const p = await col.insertOne(expenseDocument);
      res.status(200).send("Expense added: " + p.insertedId);
  } catch (err) {
      console.error(err);
      res.status(500).send("Error adding expense");
  }
});


// Route for serving the transactions page
app.get('/transactions', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'transactions.html'));
});

// Route for creating an account
app.post('/createAccount', async (req, res) => {
    const { username } = req.body;
    try {
        const db = getDb();
        const users = db.collection('users');
        const existingUser = await users.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }
        await users.insertOne({ username });
        req.session.username = username; // Set session
        res.redirect('/transactions');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating account');
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { username } = req.body;
    try {
        const db = getDb();
        const users = db.collection('users');
        const user = await users.findOne({ username });
        if (!user) {
            return res.status(401).send('User does not exist');
        }
        req.session.username = username; // Set session
        res.redirect('/transactions');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});
app.get('/expensesByMonth', async (req, res) => {
  if (!req.session.username) {
      return res.status(401).send('Unauthorized - User not logged in');
  }

  try {
      const db = client.db('FinanceTrackerApp');
      const collection = db.collection('expenses');
      const expensesByMonth = await collection.aggregate([
          { $match: { username: req.session.username } },
          { $group: {
              _id: { $month: "$date" },
              totalAmount: { $sum: {$toDouble : "$amount" }},
              count: { $sum: 1 }
          }}
      ]).toArray();
      res.json(expensesByMonth);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving expenses by month');
  }
});
app.get('/expensesByCategory', async (req, res) => {
  if (!req.session.username) {
      return res.status(401).send('Unauthorized - User not logged in');
  }

  try {
      const db = client.db('FinanceTrackerApp');
      const collection = db.collection('expenses');
      const expensesByCategory = await collection.aggregate([
          { $match: { username: req.session.username } },
          { $group: {
              _id: "$category",
              totalAmount: { $sum: {$toDouble : "$amount" }},
              count: { $sum: 1 }
          }}
      ]).toArray();
      res.json(expensesByCategory);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving expenses by category');
  }
});
// Root route redirects to the signup/login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/logout', (req, res) => {
  req.session.destroy(); // Clear the user session
  res.redirect('/'); // Redirect to the login page
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
