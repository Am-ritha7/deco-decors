// Function to show the appropriate payment form
function showPaymentForm(method) {
    document.getElementById("card-form").style.display = method === "card" ? "block" : "none";
    document.getElementById("cod-form").style.display = method === "cod" ? "block" : "none";
  }
  
  // Function to handle payment completion
  async function completePayment() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const userId = localStorage.getItem("userId"); // Assume user ID is stored in localStorage
    const amount = 500; // Replace with actual amount
  
    if (!userId) {
      alert("payment successfull");
      window.location.href = "feedback.html";
      return;
    }
  
    const paymentData = {
      userId: userId,
      paymentMethod: selectedMethod,
      amount: amount,
    };
  
    try {
      const response = await fetch("http://localhost:3000/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        alert(result.message || "Payment failed.");
        return;
      }
  
      // Redirect to feedback page with order ID
      alert("Payment successful! Redirecting to feedback...");
      window.location.href = `feedback.html?orderId=${result.orderId}`;
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("An error occurred. Please try again.");
    }
  }
  