'use client';

export default function ProductTiers() {
  return (
    <div className="product-shell">
      <div className="product-head">
        <h2>
          FIND YOUR SUNBLIX<span className="product-dot">.</span>
        </h2>
        <p>Different needs. A brighter tomorrow.</p>
      </div>
      <div className="product-grid">
        {/* PRODUCT 1: STANDARD+ */}
        <article className="product-card" id="cardStandard">
          <div className="card-tier-header">
            <div className="tier-badge-title">STANDARD+</div>
            <div className="tier-badge-sub">RESIDENTIAL</div>
            <div className="tier-badge-accent" />
          </div>
          <div className="product-photo">
            <img alt="SUNBLIX Standard+ residential solar" src="/asset/product_standard.jpg" />
          </div>
          <div className="product-details">
            <h3 className="product-name">STANDARD+</h3>
            <div className="product-tagline">
              SMART SOLAR
              <br />
              FOR EVERYDAY NEEDS
            </div>
            <div className="product-accent" />
            <div className="product-specs">
              <div className="product-spec">
                <div className="product-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <line x1="3" y1="10.5" x2="21" y2="10.5" />
                    <line x1="9" y1="4" x2="9" y2="17" />
                    <line x1="15" y1="4" x2="15" y2="17" />
                    <line x1="8" y1="20" x2="16" y2="20" />
                    <line x1="12" y1="17" x2="12" y2="20" />
                  </svg>
                </div>
                <span>2.34 – 7.02 kWp</span>
              </div>
              <div className="product-spec">
                <div className="product-icon bolt">
                  <svg viewBox="0 0 24 24">
                    <path d="M13 2L4 14h7v8l9-12h-7z" />
                  </svg>
                </div>
                <span>1 Phase</span>
              </div>
              <div className="product-spec">
                <div className="product-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
                    <path d="M9 21v-7h6v7" />
                  </svg>
                </div>
                <span className="spec-desc">Untuk kebutuhan residential sehari-hari.</span>
              </div>
            </div>
          </div>
        </article>

        {/* PRODUCT 2: PRO */}
        <article className="product-card" id="cardPro">
          <div className="card-tier-header">
            <div className="tier-badge-title">PRO</div>
            <div className="tier-badge-sub">PREMIUM RESIDENTIAL</div>
            <div className="tier-badge-accent" />
          </div>
          <div className="product-photo">
            <img alt="SUNBLIX Pro premium residential solar" src="/asset/product_pro.jpg" />
          </div>
          <div className="product-details">
            <h3 className="product-name">PRO</h3>
            <div className="product-tagline">
              MORE POWER.
              <br />
              MORE CONTROL.
            </div>
            <div className="product-accent" />
            <div className="product-specs">
              <div className="product-spec">
                <div className="product-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <line x1="3" y1="10.5" x2="21" y2="10.5" />
                    <line x1="9" y1="4" x2="9" y2="17" />
                    <line x1="15" y1="4" x2="15" y2="17" />
                    <line x1="8" y1="20" x2="16" y2="20" />
                    <line x1="12" y1="17" x2="12" y2="20" />
                  </svg>
                </div>
                <span>8.19 – 14.04 kWp</span>
              </div>
              <div className="product-spec">
                <div className="product-icon bolt">
                  <svg viewBox="0 0 24 24">
                    <path d="M13 2L4 14h7v8l9-12h-7z" />
                  </svg>
                </div>
                <span>1 Phase</span>
              </div>
              <div className="product-spec">
                <div className="product-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" />
                    <path d="M9 21v-7h6v7" />
                  </svg>
                </div>
                <span className="spec-desc">Untuk rumah besar, villa, dan kebutuhan energi lebih tinggi.</span>
              </div>
            </div>
          </div>
        </article>

        {/* PRODUCT 3: PRO+ */}
        <article className="product-card" id="cardProPlus">
          <div className="card-tier-header">
            <div className="tier-badge-title">PRO+</div>
            <div className="tier-badge-sub">COMMERCIAL & LARGE PROPERTY</div>
            <div className="tier-badge-accent" />
          </div>
          <div className="product-photo">
            <img alt="SUNBLIX Pro+ commercial solar" src="/asset/product_pro_plus.jpg" />
          </div>
          <div className="product-details">
            <h3 className="product-name">PRO+</h3>
            <div className="product-tagline">
              MAXIMUM POWER.
              <br />
              THREE-PHASE READY.
            </div>
            <div className="product-accent" />
            <div className="product-specs">
              <div className="product-spec">
                <div className="product-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <line x1="3" y1="10.5" x2="21" y2="10.5" />
                    <line x1="9" y1="4" x2="9" y2="17" />
                    <line x1="15" y1="4" x2="15" y2="17" />
                    <line x1="8" y1="20" x2="16" y2="20" />
                    <line x1="12" y1="17" x2="12" y2="20" />
                  </svg>
                </div>
                <span>9.36 – 16.38 kWp</span>
              </div>
              <div className="product-spec">
                <div className="product-icon bolt">
                  <svg viewBox="0 0 24 24">
                    <path d="M13 2L4 14h7v8l9-12h-7z" />
                  </svg>
                </div>
                <span>3 Phase</span>
              </div>
              <div className="product-spec">
                <div className="product-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <line x1="8" y1="7" x2="10" y2="7" />
                    <line x1="14" y1="7" x2="16" y2="7" />
                    <line x1="8" y1="11" x2="10" y2="11" />
                    <line x1="14" y1="11" x2="16" y2="11" />
                    <line x1="8" y1="15" x2="10" y2="15" />
                    <line x1="14" y1="15" x2="16" y2="15" />
                    <rect x="10" y="17" width="4" height="4" />
                  </svg>
                </div>
                <span className="spec-desc">Untuk properti dengan kebutuhan daya lebih tinggi.</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="product-footer">
        <div className="product-footer-item">
          <span className="footer-icon">
            <svg viewBox="0 0 24 24">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 3c0 4-1 6-2 10a7 7 0 0 1-8 7z" />
              <path d="M2 21c0-4 3-7 8-9" />
            </svg>
          </span>
          <span>CLEAN ENERGY</span>
        </div>
        <div className="product-footer-divider" />
        <div className="product-footer-item">
          <span className="footer-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span>SMART SOLUTION</span>
        </div>
        <div className="product-footer-divider" />
        <div className="product-footer-item">
          <span className="footer-icon">
            <svg viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span>BRIGHTER TOMORROW</span>
        </div>
      </div>
    </div>
  );
}
