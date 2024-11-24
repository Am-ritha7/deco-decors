document.getElementById('feedbackForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const responseMessage = document.getElementById('responseMessage');
  
    // Clear previous messages
    responseMessage.textContent = '';
  
    if (!feedbackText) {
      responseMessage.textContent = 'Feedback cannot be empty.';
      return;
    }
  
    try {
      const response = await fetch('/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback_text: feedbackText }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        responseMessage.textContent = result.message;
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        responseMessage.textContent = result.message || 'An error occurred.';
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      responseMessage.textContent = 'Failed to submit feedback. Please try again.';
    }
  });
  