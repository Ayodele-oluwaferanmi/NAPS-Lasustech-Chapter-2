async function test() {
  try {
    console.log("1. Logging in...");
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@naps.com', password: 'SecureP@ssword2026' })
    });
    const loginData = await loginRes.json();
    
    if (!loginData.token) {
      console.error('No token received');
      return;
    }
    const token = loginData.token;
    
    console.log("2. Creating an event...");
    const newEvent = {
      title: 'Test Event ' + Date.now(),
      date: 'Dec 1, 2026',
      description: 'Test description',
      image: 'test-image.jpg',
      upcoming: true,
      ongoing: false,
      contain: false,
      eventTag: 'Testing'
    };
    
    const postRes = await fetch('http://localhost:3000/api/content/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newEvent)
    });
    console.log('Update status:', postRes.status);
    const postText = await postRes.text();
    console.log('Update response:', postText);
    
    console.log("3. Verifying events...");
    const getRes = await fetch('http://localhost:3000/api/content/events');
    const events = await getRes.json();
    const createdEvent = events.find(e => e.title === newEvent.title);
    if (createdEvent) {
      console.log('Success! Found event:', createdEvent.title);
    } else {
      console.log('Failed! Event not found in array:', events.map(e => e.title));
    }
    
  } catch(e) {
    console.error('Test failed', e);
  }
}
test();
