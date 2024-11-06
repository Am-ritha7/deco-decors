const form = document.getElementById("registrationForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = {
    username: form.username.value,
    name: form.name.value,
    phoneNo: form.phoneNo.value,
    gender: form.gender.value,
    email: form.email.value,
    password: form.password.value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Registration successful!");
      form.reset();
    } else {
      alert("Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was an error with your registration.");
  }
});
