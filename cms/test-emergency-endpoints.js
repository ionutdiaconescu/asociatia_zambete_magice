// Test emergency endpoints to verify API token access
const fetch = require('node-fetch');

async function testEmergencyEndpoints() {
  const baseUrl = process.env.STRAPI_ADMIN_CLIENT_URL || 'https://asociatia-zambete-magice.onrender.com';
  
  console.log('🚨 Testing Emergency Endpoints\n');
  console.log(`Base URL: ${baseUrl}\n`);

  try {
    // Test 1: Check status
    console.log('1️⃣ Testing emergency status endpoint...');
    const statusResponse = await fetch(`${baseUrl}/admin/emergency-status`);
    const statusData = await statusResponse.json();
    
    console.log('📊 Status Response:');
    console.log(JSON.stringify(statusData, null, 2));
    console.log('\n');

    // Test 2: List existing tokens
    console.log('2️⃣ Testing emergency tokens list...');
    const tokensResponse = await fetch(`${baseUrl}/admin/emergency-tokens`);
    const tokensData = await tokensResponse.json();
    
    console.log('📋 Tokens Response:');
    console.log(JSON.stringify(tokensData, null, 2));
    console.log('\n');

    // Test 3: Create new emergency token if needed
    if (tokensData.success && tokensData.count < 3) {
      console.log('3️⃣ Creating new emergency token...');
      const createResponse = await fetch(`${baseUrl}/admin/emergency-fix`);
      const createData = await createResponse.json();
      
      console.log('🆕 Create Token Response:');
      console.log(JSON.stringify(createData, null, 2));
    } else {
      console.log('3️⃣ Skipping token creation - sufficient tokens exist');
    }

  } catch (error) {
    console.error('💥 Error testing endpoints:', error.message);
    
    // Fallback: test if server is running at all
    console.log('\n🔍 Checking if server is accessible...');
    try {
      const healthResponse = await fetch(`${baseUrl}/_health`);
      console.log(`Health check status: ${healthResponse.status}`);
    } catch (healthError) {
      console.error('❌ Server not accessible:', healthError.message);
    }
  }
}

testEmergencyEndpoints();