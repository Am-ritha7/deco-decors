// Function to show the appropriate payment form
function showPaymentForm(method) {
    document.getElementById("card-form").style.display = method === 'card' ? 'block' : 'none';
    document.getElementById("qr-form").style.display = method === 'qr' ? 'block' : 'none';
    document.getElementById("cod-form").style.display = method === 'cod' ? 'block' : 'none';
}

// Function to handle payment completion
function completePayment() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    switch (selectedMethod) {
        case 'card':
            // Validate card details, and proceed with payment
            alert("Card payment successful!");
            break;
        case 'qr':
            // Simulate QR code payment confirmation
            alert("QR code payment successful!");
            break;
        case 'cod':
            // Confirm cash on delivery order
            alert("Order placed for Cash on Delivery!");
            break;
        default:
            alert("Please select a payment method.");
    }

    // In a real application, here you would send the payment data to your server
}
