const Footer = () => (
  <footer>
    <div className="footer-grid">
      <div>
        <div className="footer-logo">BookSmart</div>
        <p className="footer-desc">A smart book discovery platform built for Indian readers. Find the right book for your life situation — not just bestseller lists.</p>
      </div>
      <div>
        <div className="footer-col-title">Discover</div>
        <ul className="footer-links"><li>By Problem</li><li>By Mood</li><li>By Language</li><li>Reading Paths</li></ul>
      </div>
      <div>
        <div className="footer-col-title">Platform</div>
        <ul className="footer-links"><li>About Us</li><li>How It Works</li><li>Affiliate Links</li><li>Contact</li></ul>
      </div>
      <div>
        <div className="footer-col-title">Legal</div>
        <ul className="footer-links"><li>Privacy Policy</li><li>No Piracy Policy</li><li>Affiliate Disclosure</li></ul>
      </div>
    </div>
    <div className="footer-bottom">
      <span className="footer-copy">© 2025 BookSmart · ShopSmart Project · MERN Stack</span>
      <span className="footer-copy">Affiliate links to Amazon &amp; Flipkart. No piracy. No copyright violations.</span>
    </div>
  </footer>
);

export default Footer;
