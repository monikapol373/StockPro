import React from "react";

/* Pure CSS 3D warehouse. No libraries needed. */

const face = (w, h, t, background, extra) => ({
  width: w,
  height: h,
  marginLeft: -w / 2,
  marginTop: -h / 2,
  transform: t,
  background,
  ...extra,
});

// x, z = centre on the floor, y = height of the bottom edge
const Cub = ({ w, h, d, x = 0, y = 0, z = 0, c = "#3b3f9a", glow }) => {
  const g = glow ? { boxShadow: `0 0 16px ${glow}` } : undefined;
  return (
    <div className="cw-cub" style={{ transform: `translate3d(${x}px, ${-(y + h / 2)}px, ${z}px)` }}>
      <i className="cw-f cw-ft" style={face(w, d, `rotateX(90deg) translateZ(${h / 2}px)`, c, g)} />
      <i className="cw-f cw-ff" style={face(w, h, `translateZ(${d / 2}px)`, c)} />
      <i className="cw-f cw-fr" style={face(d, h, `rotateY(90deg) translateZ(${w / 2}px)`, c)} />
      <i className="cw-f cw-fl" style={face(d, h, `rotateY(-90deg) translateZ(${w / 2}px)`, c)} />
      <i className="cw-f cw-fk" style={face(w, h, `rotateY(180deg) translateZ(${d / 2}px)`, c)} />
    </div>
  );
};

const BOX = ["#c58a4b", "#b27a3d", "#d89c5c"];

const Rack = ({ x, z, fill, edge }) => (
  <div className="cw-grp" style={{ transform: `translate3d(${x}px, 0, ${z}px)` }}>
    {[[-47, -14], [47, -14], [-47, 14], [47, 14]].map(([px, pz], i) => (
      <Cub key={i} w={5} h={100} d={5} x={px} z={pz} c="#2a2f78" />
    ))}
    {[8, 42, 76].map((sy, si) => (
      <React.Fragment key={sy}>
        <Cub w={100} h={4} d={34} y={sy} c={edge} glow={edge} />
        {[-26, 26].map((cx, ci) =>
          si * 2 + ci < fill ? (
            <Cub key={ci} w={38} h={26} d={26} x={cx} y={sy + 4} c={BOX[(si + ci) % 3]} />
          ) : null
        )}
      </React.Fragment>
    ))}
  </div>
);

const ZONES = [
  { x: -150, z: -105, fill: 6, edge: "#22d3ee" },
  { x: 150, z: -105, fill: 4, edge: "#fb923c" },
  { x: -150, z: 105, fill: 5, edge: "#34d399" },
  { x: 150, z: 105, fill: 1, edge: "#f43f5e" },
];

const CssWarehouse = ({ className = "" }) => (
  <div className={`cw-stage ${className}`}>
    <style>{CSS}</style>
    <div className="cw-glow" />
    <div className="cw-world">
      <div className="cw-sway">
        <Cub w={604} h={6} d={424} y={-20} c="#7c3aed" glow="#7c3aed" />
        <Cub w={590} h={14} d={410} y={-14} c="#161c66" />

        {ZONES.map((zn) => (
          <React.Fragment key={`${zn.x}${zn.z}`}>
            <Cub w={270} h={1} d={170} x={zn.x} z={zn.z} y={0} c={`${zn.edge}2e`} />
            <Rack x={zn.x - 62} z={zn.z} fill={zn.fill} edge={zn.edge} />
            <Rack x={zn.x + 62} z={zn.z} fill={Math.max(zn.fill - 1, 0)} edge={zn.edge} />
          </React.Fragment>
        ))}

        <Cub w={520} h={1} d={10} y={0} c="#22d3ee" glow="#22d3ee" />

        <div className="cw-grp" style={{ transform: "translate3d(-385px, 0, 0)" }}>
          <Cub w={130} h={64} d={64} y={6} c="#e8ecff" />
          <Cub w={42} h={46} d={58} x={88} y={6} c="#7c3aed" glow="#7c3aed" />
          <Cub w={170} h={3} d={70} y={0} c="#22d3ee" glow="#22d3ee" />
        </div>

        <div className="cw-grp cw-fork">
          <Cub w={34} h={18} d={24} y={4} c="#fbbf24" />
          <Cub w={18} h={22} d={20} x={-6} y={22} c="#f59e0b" />
          <Cub w={4} h={46} d={4} x={18} y={4} c="#6b7280" />
          <Cub w={14} h={3} d={18} x={26} y={6} c="#9ca3af" />
        </div>
      </div>
    </div>
  </div>
);

const CSS = `
.cw-stage { position:relative; width:100%; height:100%; perspective:1700px; perspective-origin:50% 28%; --cw-scale:.8; }
.cw-glow { position:absolute; left:50%; top:62%; width:96%; height:52%; transform:translate(-50%,-50%); background:radial-gradient(closest-side,rgba(124,58,237,.6),rgba(34,211,238,.15) 60%,transparent); filter:blur(28px); pointer-events:none; }
.cw-world { position:absolute; left:50%; top:60%; width:0; height:0; transform-style:preserve-3d; transform:scale(var(--cw-scale)) rotateX(-27deg); }
.cw-sway { transform-style:preserve-3d; animation:cwSway 18s ease-in-out infinite alternate; }
@keyframes cwSway { from { transform:rotateY(-34deg); } to { transform:rotateY(26deg); } }
.cw-cub, .cw-grp { position:absolute; left:0; top:0; width:0; height:0; transform-style:preserve-3d; }
.cw-f { position:absolute; left:0; top:0; display:block; backface-visibility:hidden; }
.cw-ft { filter:brightness(1.22); } .cw-ff { filter:brightness(.92); } .cw-fr { filter:brightness(.7); } .cw-fl { filter:brightness(.56); } .cw-fk { filter:brightness(.48); }
.cw-fork { animation:cwFork 9s ease-in-out infinite alternate; }
@keyframes cwFork { from { transform:translate3d(-135px,0,0); } to { transform:translate3d(135px,0,0); } }
@media (prefers-reduced-motion: reduce) { .cw-sway, .cw-fork { animation:none; } }
`;

export default CssWarehouse;