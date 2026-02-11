// Simple test to verify rankings API structure
const route = require('./app/api/rankings/route.ts');

console.log('Rankings API route exports:', Object.keys(route));
console.log('GET function exists:', typeof route.GET === 'function');
