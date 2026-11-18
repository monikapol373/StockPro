
import React from "react";

const WarehouseShowcase = () => {
  return (
    <section className="sp-showcase">
      <div className="sp-showcase-copy">
        <span className="sp-eyebrow">
          <span className="sp-status-dot" />
          SMART INVENTORY INTELLIGENCE
        </span>

        <h2>
          Your warehouse,
          <br />
          <span>under control.</span>
        </h2>

        <p>
          Monitor stock, production, supplier activity and order risks
          from one intelligent command center.
        </p>

        <div className="sp-feature-chips">
          <span>✦ Live inventory</span>
          <span>✦ Smart alerts</span>
          <span>✦ Production insights</span>
        </div>
      </div>

      <div className="sp-warehouse-scene">
        <div className="sp-scene-glow" />

        <div className="sp-float-tag sp-tag-one">
          <span>📦</span>
          <div>
            <strong>Stock Watch</strong>
            <small>Inventory monitoring</small>
          </div>
        </div>

        <div className="sp-float-tag sp-tag-two">
          <span>🏭</span>
          <div>
            <strong>Production</strong>
            <small>Capacity insights</small>
          </div>
        </div>

        <div className="sp-warehouse">
          <div className="sp-warehouse-roof" />

          <div className="sp-warehouse-building">
            <div className="sp-warehouse-sign">
              <span>◆</span> STOCKPRO
            </div>

            <div className="sp-warehouse-shelves">
              {[0, 1, 2].map((row) => (
                <div className="sp-shelf-row" key={row}>
                  {[0, 1, 2, 3].map((box) => (
                    <div
                      className={`sp-box sp-box-${(row + box) % 4}`}
                      key={box}
                    >
                      <span />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="sp-warehouse-door">
              <span />
              <span />
            </div>
          </div>

          <div className="sp-warehouse-base" />
        </div>

        <div className="sp-robot" aria-label="StockPro AI Assistant">
          <div className="sp-robot-antenna" />
          <div className="sp-robot-head">
            <div className="sp-robot-ear sp-robot-ear-left" />
            <div className="sp-robot-ear sp-robot-ear-right" />
            <div className="sp-robot-face">
              <span className="sp-robot-eye" />
              <span className="sp-robot-eye" />
              <span className="sp-robot-mouth" />
            </div>
          </div>
          <div className="sp-robot-body">
            <span>✦</span>
          </div>
          <div className="sp-robot-shadow" />
        </div>

        <div className="sp-ai-caption">
          <span className="sp-ai-sparkle">✦</span>
          <div>
            <strong>StockPro AI</strong>
            <small>Your smart inventory companion</small>
          </div>
          <span className="sp-ai-online" />
        </div>
      </div>
    </section>
  );
};

export default WarehouseShowcase;
