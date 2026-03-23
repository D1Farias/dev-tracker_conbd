const http = require('http');

['users', 'projects', 'work-entries'].forEach(endpoint => {
  http.get(`http://localhost:3000/api/${endpoint}`, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(`${endpoint} returned ${res.statusCode}:`, rawData.substring(0, 100));
    });
  }).on('error', (e) => {
    console.error(`Got error for ${endpoint}: ${e.message}`);
  });
});
