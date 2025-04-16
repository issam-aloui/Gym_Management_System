class CTAButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        button {
          margin-top: 20px;
          padding: 12px 28px;
          font-family: "Nunito Sans", sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: linear-gradient(45deg, #e85d04, #f48c06, #ffba08);
          background-size: 200% auto;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(232, 93, 4, 0.4);
          transition: all 0.3s ease;
        }

        button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: 0.5s;
        }

        button:hover {
          background-position: right center;
          box-shadow: 0 6px 20px rgba(232, 93, 4, 0.6);
          transform: translateY(-3px);
        }

        button:active {
          transform: translateY(1px);
          box-shadow: 0 2px 10px rgba(232, 93, 4, 0.4);
        }

        button:hover::before {
          left: 100%;
        }
      </style>
      <button><slot></slot></button>
    `;
  }
}

customElements.define("cta-button", CTAButton);
