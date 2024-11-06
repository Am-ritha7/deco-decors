const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      message.textContent = "Login successful!";
      message.style.color = "green";
      window.location.href = "/home.html";
    } else {
      message.textContent = "Login failed. Please check your credentials.";
      message.style.color = "red";
    }
  } catch (error) {
    console.error("Error:", error);
    message.textContent = "An error occurred during login.";
    message.style.color = "red";
  }
});
