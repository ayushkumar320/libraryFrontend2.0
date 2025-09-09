// Quick test script to check API endpoints
const BASE_URL =
  "https://project-beta-backend-library-manage.vercel.app/api/admin";

async function testLogin() {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "naiudaan56@gmail.com",
        password: "naiudaan56",
      }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (data.token) {
      return data.token;
    }
  } catch (error) {
    console.error("Login error:", error);
  }
  return null;
}

async function testSubscriptionPlans(token) {
  try {
    const response = await fetch(`${BASE_URL}/subscriptions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Subscription plans response:", data);
    return data;
  } catch (error) {
    console.error("Subscription plans error:", error);
  }
}

async function testRegistration(token) {
  try {
    // Use the actual plan ID we found
    const testRegistrationData = {
      name: "Test Student 2",
      adharNumber: 999999999999, // Different Aadhar
      subscriptionPlan: "68b9822755ca6df18c0fafa3", // Valid ObjectId from above
      joiningDate: "2024-12-31",
      feePaid: true,
      seatNumber: "B99", // Different seat
      age: 25,
      address: "Test Address",
      idNumber: 99999, // Different ID
      isActive: true,
    };

    console.log("Testing registration with data:", testRegistrationData);

    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRegistrationData),
    });

    const data = await response.json();
    console.log("Registration response:", response.status, data);
    return data;
  } catch (error) {
    console.error("Registration error:", error);
  }
}

async function runTests() {
  console.log("Testing API endpoints...");

  const token = await testLogin();
  if (!token) {
    console.log("Login failed");
    return;
  }

  console.log("\nTesting subscription plans...");
  const plans = await testSubscriptionPlans(token);

  console.log("\nTesting registration...");
  const registrationResult = await testRegistration(token);
}

runTests();
