import { apiSetupAdmin } from './src/utils/authClient.ts';
async function run() {
  const res = await apiSetupAdmin({
    fullName: "Admin Name",
    email: "admin@example.com",
    matricNumber: "ADMIN001",
    phoneNumber: "1234567890",
    password: "SuperSecret123@!",
    setupSecret: ""
  });
  console.log(res);
}
run();
