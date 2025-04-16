customElements.define(
  "my-footer",
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<footer class="footer" id="footer">
        <div class="footer-left">
            <h2 class="logo">GymFit</h2>
            <p>Helping you manage your gym and fitness journey effortlessly.</p>
        </div>
        <div class="footer-middle">
            <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#Features">Features</a></li>
                <li><a href="#Testimonial">Testimonial</a></li>
                <li><a href="login.html">Login</a></li>
                <li><a href="signup.html">Sign up</a></li>
            </ul>
        </div>
        <div class="footer-right">
            <p class="cus">Contact us</p>
            <p><i class="fas fa-phone-alt"></i> +1 234 567 890</p>
            <p><i class="fas fa-envelope"></i> support@gymwebsite.com</p>
            <div class="social-icons">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-linkedin-in"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2025 GymFit. All rights reserved.</p>
        </div>
    </footer>`;
    }
  }
);
const footerLink = document.createElement("link");
footerLink.rel = "stylesheet";
footerLink.href = "../css/footer.css";
document.head.appendChild(footerLink);