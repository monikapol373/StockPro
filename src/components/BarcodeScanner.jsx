import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [lastScan, setLastScan] = useState("");
  const [flashOn, setFlashOn] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices);
        const back = devices.find((d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        );
        setSelectedCamera(back?.deviceId || devices[0]?.deviceId || "");
      })
      .catch(() => setError("Camera access denied. Please allow camera permission."));
  }, []);

  useEffect(() => {
    if (!selectedCamera || !scanning) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader.decodeFromVideoDevice(
      selectedCamera,
      videoRef.current,
      (result, err) => {
        if (result) {
          const text = result.getText();
          if (text !== lastScan) {
            setLastScan(text);
            navigator.vibrate?.(200);
            onScan(text);
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn("Scanner error:", err);
        }
      }
    ).then((controls) => {
      streamRef.current = controls;
    }).catch((err) => {
      setError("Could not start camera: " + err.message);
    });

    return () => {
      try {
        readerRef.current?.reset();
        streamRef.current?.stop?.();
      } catch { /* ignore cleanup errors */ }
    };
  }, [selectedCamera, scanning]);

  const toggleFlash = async () => {
    try {
      const track = videoRef.current?.srcObject?.getVideoTracks?.()?.[0];
      if (!track) return;
      const capabilities = track.getCapabilities();
      if (!capabilities.torch) return;
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
      setFlashOn(!flashOn);
    } catch { /* torch not supported */ }
  };

  return (
    <div className="bs-overlay">
      <div className="bs-modal">
        <div className="bs-header">
          <h2>📷 Barcode Scanner</h2>
          <button className="bs-close" onClick={onClose}>✕</button>
        </div>

        {error ? (
          <div className="bs-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="bs-btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="bs-viewfinder">
              <video ref={videoRef} className="bs-video" autoPlay muted playsInline />
              <div className="bs-frame">
                <i className="bs-corner tl" />
                <i className="bs-corner tr" />
                <i className="bs-corner bl" />
                <i className="bs-corner br" />
                <div className="bs-scan-line" />
              </div>
              <div className="bs-hint">Point camera at barcode or QR code</div>
            </div>

            {cameras.length > 1 && (
              <select
                className="bs-select"
                value={selectedCamera}
                onChange={(e) => {
                  try { readerRef.current?.reset(); } catch { /* ignore */ }
                  setSelectedCamera(e.target.value);
                }}
              >
                {cameras.map((c) => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `Camera ${c.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            )}

            <div className="bs-controls">
              <button className="bs-btn-ghost" onClick={toggleFlash}>
                {flashOn ? "🔦 Flash Off" : "💡 Flash On"}
              </button>
              <button
                className="bs-btn-ghost"
                onClick={() => setScanning(!scanning)}
              >
                {scanning ? "⏸ Pause" : "▶ Resume"}
              </button>
            </div>

            {lastScan && (
              <div className="bs-last-scan">
                <span>Last scan:</span>
                <code>{lastScan}</code>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;