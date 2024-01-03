const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Set up CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const port = process.env.PORT || 3000;
const dbURI = process.env.mongodbURI || 'mongodb+srv://shahroz:Sheroo123*@cluster0.gn2f1y4.mongodb.net';
const dbName = 'test';

// Connect to the MongoDB database
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Connected to the MongoDB database!');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Set up CORS middleware
app.use(cors());
// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

// Define the data schema
const yourSchema = new mongoose.Schema({

  id: { type: String, required: true },
  name: { type: String, required: true },
  birthYear: { type: Number, required: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true },
  membership: { type: String, required: true },
});

const YourModel = mongoose.model('YourModel', yourSchema);

const usedIds = new Set(); // Set to keep track of used IDs

let lastUsedId = 0; // Initialize the counter

// Handle POST request to save form data
app.post('/saveForm', async (req, res) => {
  const { id, name, birthYear, phone, gender, membership } = req.body;

  try {
    lastUsedId++; // Increment the counter for each new admission

    // const uniqueId = generateUniqueId();
    // while (usedIds.has(uniqueId)) {
    //   uniqueId = generateUniqueId(); a
    // }

    const newData = new YourModel({
      id: lastUsedId,
      name,
      birthYear,
      phone,
      gender,
      membership,
    });

    await newData.save();
    console.log('Data saved to the database successfully!');
    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Error saving data' });
  }
});

// Function to generate a unique ID
function generateUniqueId() {
  // Implement your logic to generate a unique ID
  // For example: "SG-1", "SG-2", ...
  // const prefix = "SG-";
  const randomNumber = Math.floor(Math.random() * 1000) + 1; // Generate a random number
  return `${randomNumber}`;
}

const validAdminID = "sheroo";
const validPassword = "gymnastic123";

// Handle login POST request
app.post("/login", (req, res) => {
  const { adminID, password } = req.body;

  if (adminID === validAdminID && password === validPassword) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});


// Handle GET request to fetch admission data
app.get('/getAdmissionData', async (req, res) => {
  try {
    const admissionData = await YourModel.find({}).lean();

    // Calculate age based on birth year
    const currentYear = new Date().getFullYear();
    const dataWithAge = admissionData.map(entry => {
      const birthYear = parseInt(entry.birthYear);
      const age = currentYear - birthYear;

      return {
        ...entry,
        id: `SG-${entry.id}`,
        age: age
      };
    });

    res.json(dataWithAge);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/getAdmissionData/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await YourModel.findById(id).lean();

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(entry.birthYear);
    const age = currentYear - birthYear;

    // Include the calculated age in the response
    const entryWithAge = {
      ...entry,
      id: `SG-${entry.id}`,
      age: age
    };

    res.json(entryWithAge);
  } catch (error) {
    console.error('Error finding document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Handle PUT request to update an entry
app.put('/updateEntry/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, phone, gender, membership } = req.body;

  try {
    console.log('Updating data for ID:', id);

    const updatedData = {
      name,
      age,
      phone,
      gender,
      membership,
    };

    const result = await YourModel.findByIdAndUpdate(id, updatedData);

    if (!result) {
      console.log('No matching document found for ID:', id);
      return res.status(404).json({ error: 'Entry not found' });
    }

    console.log('Data updated in the database successfully!');
    res.json({ message: 'Data updated successfully' });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Error updating data' });
  }
})



app.delete('/deleteEntry/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await YourModel.findByIdAndDelete(id);
    console.log('Data deleted from the database successfully!');
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Error deleting data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
