async function test() {
  try {
    console.log("1. Logging in...");
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@naps.com', password: 'SecureP@ssword2026' })
    });
    const loginData = await loginRes.json();
    console.log('Login response:', loginData.message || loginData.error || "Success");
    
    if (!loginData.token) {
      console.error('No token received:', loginData);
      return;
    }
    
    const token = loginData.token;
    
    console.log("2. Fetching current settings...");
    const getSettingsRes = await fetch('http://localhost:3000/api/content/site-settings');
    const settings = await getSettingsRes.json();
    
    console.log("3. Updating settings...");
    const updatedSettings = {
      ...settings,
      associationName: 'National Association of Physics Students - Updated Test ' + Date.now()
    };
    
    const postSettingsRes = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedSettings)
    });
    console.log('Update status:', postSettingsRes.status);
    const postSettingsText = await postSettingsRes.text();
    console.log('Update settings response:', postSettingsText);
    
    console.log("4. Verifying settings...");
    const verifySettingsRes = await fetch('http://localhost:3000/api/content/site-settings');
    const newSettings = await verifySettingsRes.json();
    console.log('Verified associationName:', newSettings.associationName);
    
  } catch(e) {
    console.error('Test failed', e);
  }
}
test();
