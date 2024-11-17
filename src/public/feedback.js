// Submit feedback via AJAX
document.getElementById("feedbackForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the form
    const rating = document.getElementById("productRating").value;
    const review = document.getElementById("productReview").value;

    // Prepare data to send to server
    const feedbackData = new FormData();
    feedbackData.append("productRating", rating);
    feedbackData.append("productReview", review);

    // Send the data using fetch API (AJAX)
    fetch("submit-feedback.php", {
        method: "POST",
        body: feedbackData
    })
    .then(response => response.json()) // Parse response as JSON
    .then(data => {
        if (data.success) {
            alert("Feedback submitted successfully!");
            document.getElementById("feedbackForm").reset(); // Reset form after successful submission
        } else {
            alert("There was an error submitting your feedback. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error submitting feedback:", error);
        alert("Error submitting feedback. Please try again.");
    });
});
