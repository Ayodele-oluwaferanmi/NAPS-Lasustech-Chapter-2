async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@naps.com', password: 'SecureP@ssword2026' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    // Get all people
    const getRes = await fetch('http://localhost:3000/api/content/people');
    const people = await getRes.json();
    if (!people || people.length === 0) {
      console.log('No people found');
      return;
    }
    
    const person = people[0];
    console.log('Original person:', person.name, person.post);
    
    // Update the person
    const updatedPerson = {
      ...person,
      name: person.name + ' Updated'
    };
    
    const putRes = await fetch(`http://localhost:3000/api/content/people/${person.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedPerson)
    });
    
    console.log('Update status:', putRes.status);
    console.log('Update response:', await putRes.text());
    
    // Verify
    const verifyRes = await fetch('http://localhost:3000/api/content/people');
    const verifyPeople = await verifyRes.json();
    const vPerson = verifyPeople.find(p => p.id === person.id);
    console.log('Verified person:', vPerson.name);
  } catch(e) {
    console.error(e);
  }
}
test();
