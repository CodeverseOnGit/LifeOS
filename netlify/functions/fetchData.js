const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Adjust path if your JSON is in public folder
    const dataPath = path.join(__dirname, '../../public/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    
    // Optional: encrypt here if you want extra security
    return {
      statusCode: 200,
      body: rawData,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not read JSON' }),
    };
  }
};