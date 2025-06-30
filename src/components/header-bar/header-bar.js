class HeaderBar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: #222;
          color: #fff;
          padding: 1rem 0;
          text-align: center;
          font-size: 2rem;
          letter-spacing: 2px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header-content {
          display: flex;
          justify-content: left;
          gap: 1rem;
          padding-left: 0.7rem;
        }
        .logo {
          width: 40px;
          height: 40px;
          background: url('assets/fretmonkey-favicon.svg') no-repeat center/contain;
          border-radius: 50%;
        }
        .title {
          font-weight: bold;
        }
        @media (max-width: 600px) {
          :host {
            font-size: 1.1rem;
            padding: 0.5rem 0;
          }
          .header-content {
            gap: 0.5rem;
          }
          .logo {
            width: 32px;
            height: 32px;
          }
          .title {
            font-size: 1.5rem;
          }
        }
      </style>
      <div class="header-content">
        <div class="logo" aria-label="fretMonkey logo"></div>
        <span class="title">fretMonkey</span>
      </div>
    `;
  }
}
customElements.define('header-bar', HeaderBar);
