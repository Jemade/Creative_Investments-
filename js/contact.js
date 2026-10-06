/**
 * Creative Wing Investments — Contact Form & Interaction Handler
 */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value : 'General Inquiry';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !phone || !message) {
      if (statusEl) {
        statusEl.textContent = 'Please fill in all required fields (Name, Phone number, and Message).';
        statusEl.style.color = '#EF4444';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Preparing WhatsApp...';
    }

    // Build WhatsApp message for instant direct routing to Harare office
    const text = "Hello Creative Wing Investments,\n\nName: " + name + "\nPhone: " + phone + "\nDivision: " + subject + "\nMessage: " + message + "\n\nPlease get back to me. Thank you!";
    const waBase = (typeof getWhatsAppBaseUrl === 'function') ? getWhatsAppBaseUrl() : 'https://wa.me/263785783150';
    const waUrl = waBase + '?text=' + encodeURIComponent(text);

    if (statusEl) {
      statusEl.textContent = 'Connecting to WhatsApp...';
      statusEl.style.color = 'var(--lime)';
    }

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener');
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Inquiry via WhatsApp';
      }
      if (statusEl) {
        statusEl.textContent = 'Inquiry prepared. Continue conversation on WhatsApp.';
      }
    }, 450);
  });
}

document.addEventListener('DOMContentLoaded', initContactPage);

