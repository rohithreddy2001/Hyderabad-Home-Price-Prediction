// src/App.jsx
import React, { useState } from "react";
import Header from "./components/Header";
import FormPanel from "./components/FormPanel";
import ResultPanel from "./components/ResultPanel";
import "./index.css";

export default function App() {
  const [result, setResult] = useState(null);

  // now accepts a report object (the full payload returned by FormPanel)
  function handleSave(report) {
    if (!report) return alert("Nothing to save yet");
    const reports = JSON.parse(localStorage.getItem("homeprice_reports") || "[]");
    const item = { id: Date.now(), saved_at: new Date().toISOString(), report };
    reports.unshift(item);
    localStorage.setItem("homeprice_reports", JSON.stringify(reports));
    alert("Saved to local reports");
  }

  // now accepts a report object and downloads it
  function handleDownload(report) {
    if (!report) return alert("Nothing to download yet");
    const payload = {
      saved_at: new Date().toISOString(),
      report
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // friendly filename using locality & timestamp (safe fallback)
    const nameSafe = (report.locality || "report").replace(/\s+/g, "_").toLowerCase();
    a.download = `homeprice_${nameSafe}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Header />

      <main className="app" role="main">
        <FormPanel onResult={setResult} />
        <ResultPanel
          result={result}
          onSave={handleSave}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}
