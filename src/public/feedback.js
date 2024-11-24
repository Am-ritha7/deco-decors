// Function to handle feedback form submission
async function submitFeedback() {
  const rating = document.querySelector('input[name="rating"]:checked');
  const feedbackText = document.getElementById("feedbackText").value;

  if (!rating || !feedbackText) {
    alert("Please provide a rating and feedback text.");
    return;
  }

  // Fetch order_id from the URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const order_id = urlParams.get('orderId');

  if (!order_id) {
    alert("Order ID is missing from the URL.");
    return;
  }

  const user_id = 1; // Replace with the actual logged-in user ID (dynamically fetched if necessary)
  const ratingValue = rating.value;

  const feedbackData = {
    user_id: user_id,
    order_id: order_id,  // Include order_id from query
    rating: ratingValue,
    comments: feedbackText
  };

  const token = localStorage.getItem("token");// Assuming user_id is stored in localStorage
  if (!token) {
    alert("You must be logged in to add items to the cart.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/submit-feedback", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Feedback submitted successfully!");
      window.location.href = "shop.html";
      document.getElementById("feedbackForm").reset();
    } else {
      alert(data.message || "Error submitting feedback");
    }
  } catch (err) {
    console.error("Error submitting feedback:", err);
    alert("An error occurred. Please try again.");
  }
}
