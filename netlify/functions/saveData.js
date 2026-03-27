const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // Store in a file inside the function directory (or somewhere persistent)
    // For small apps, Netlify allows a "tmp" folder during the function execution
    const filePath = path.join(__dirname, '../../data.json');

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return {
      statusCode: 200,
      body: 'Saved successfully',
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'Error saving data',
    };
  }
};