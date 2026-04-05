const nodemailer = require('nodemailer');

const header = `
<div style="background-color: #F2E4C8; color: #2C1F0E; font-family: 'Nunito', sans-serif; padding: 40px; text-align: center;">
  <h1 style="font-family: 'Fredoka One', cursive; color: #2C1F0E; margin-bottom: 30px; font-size: 32px; letter-spacing: -1px;">
    Book<span style="color: #D47B4A;">Smart</span>
  </h1>
  <div style="background-color: #FFFFFF; border-radius: 16px; padding: 40px; text-align: left; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
`;

const footer = `
  </div>
  <p style="margin-top: 40px; color: #7B6B5B; font-size: 14px;">
    BookSmart — Your Cozy Digital Bookshop<br>
    <a href="#" style="color: #2D6A4F;">Unsubscribe</a> from these updates.
  </p>
</div>
`;

const getButton = (text, url) => `
  <div style="text-align: center; margin: 30px 0;">
    <a href="${url}" style="background-color: #2D6A4F; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block;">
      ${text}
    </a>
  </div>
`;

const templates = {
  welcomeEmail: (data) => `
    <h2>Welcome to BookSmart, ${data.name}! 📚</h2>
    <p>Your cozy book corner is ready. We're thrilled to have you join our community of readers.</p>
    ${getButton('Explore Books', process.env.FRONTEND_URL || 'http://localhost:5173')}
  `,
  verifyEmail: (data) => `
    <h2>Verify Your Email, ${data.name}</h2>
    <p>Please confirm your email address to unlock full access to BookSmart.</p>
    ${getButton('Verify Email', data.verifyUrl)}
  `,
  resetPasswordEmail: (data) => `
    <h2>Password Reset Request</h2>
    <p>Hi ${data.name},</p>
    <p>We received a request to reset your BookSmart password. Click the button below to choose a new password.</p>
    ${getButton('Reset Password', data.resetUrl)}
    <p>If you didn't request this, you can safely ignore this email.</p>
  `,
  orderConfirmationEmail: (data) => `
    <h2>Order Confirmed! 🎉</h2>
    <p>Thank you for your order, <strong>${data.order.orderNumber}</strong>. We're getting your books ready for the journey.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #F2E4C8;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: right;">Qty</th>
          <th style="padding: 10px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${data.order.items.map(item => `
          <tr style="border-bottom: 1px solid #F2E4C8;">
            <td style="padding: 10px;">${item.title}</td>
            <td style="padding: 10px; text-align: right;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">₹${item.price}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="text-align: right; margin-top: 20px;">
      <p>Subtotal: ₹${data.order.pricing.subtotal}</p>
      ${data.order.pricing.couponDiscount > 0 ? `<p>Discount: -₹${data.order.pricing.couponDiscount}</p>` : ''}
      <p>Shipping: ₹${data.order.pricing.shipping}</p>
      <p>Tax: ₹${data.order.pricing.tax}</p>
      <h3>Total: ₹${data.order.pricing.total}</h3>
    </div>
    <p>Shipping to:<br>
    ${data.order.shippingAddress.fullName}<br>
    ${data.order.shippingAddress.line1}<br>
    ${data.order.shippingAddress.city}, ${data.order.shippingAddress.state} ${data.order.shippingAddress.pincode}
    </p>
  `,
  orderShippedEmail: (data) => `
    <h2>Your Books Are on the Way! 🚚</h2>
    <p>Good news! Your order <strong>${data.order.orderNumber}</strong> has been shipped.</p>
    ${data.order.tracking && data.order.tracking.url ? getButton('Track Package', data.order.tracking.url) : '<p>Your order is en route.</p>'}
    <p>Estimated Delivery: Relax, it's coming soon.</p>
  `,
  orderDeliveredEmail: (data) => `
    <h2>Your Order Has Arrived! 📦</h2>
    <p>We hope you enjoy your new books!</p>
    ${getButton('Write a Review', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/home`)}
  `,
  orderCancelledEmail: (data) => `
    <h2>Order Cancelled</h2>
    <p>Your order <strong>${data.order ? data.order.orderNumber : ''}</strong> has been cancelled.</p>
    <p><strong>Reason:</strong> ${data.reason || 'Requested by user.'}</p>
    <p>If you have already paid, a refund will be processed to your original payment method shortly.</p>
  `
};

const sendEmail = async ({ to, subject, html, template, data }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailHtml = html;
  
  if (template && templates[template]) {
    mailHtml = header + templates[template](data) + footer;
  } else if (html && !html.includes('<html')) {
    // If the controller passed a string matching a key in our templates map blindly inside 'html'
    if (templates[html] && data && data.order) {
      mailHtml = header + templates[html]({ order: data.order, ...data }) + footer;
    } else {
      mailHtml = header + html + footer;
    }
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'BookSmart <noreply@booksmart.in>',
    to,
    subject,
    html: mailHtml,
  };

  if (process.env.NODE_ENV === 'test') {
    // console.log(`[TEST] Mock email sent to ${to}: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Email send failure to ${to}: `, error);
  }
};

module.exports = sendEmail;
