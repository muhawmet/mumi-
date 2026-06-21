import React from "react";
import { useStudioStore } from "../../store/useStudioStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const currentStep = useStudioStore((state) => state.currentStep);
  const setCurrentStep = useStudioStore((state) => state.setCurrentStep);

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily: "sans-serif" }}>
      {/* Sidebar Navigation */}
      <nav style={{ width: "250px", background: "#f4f4f4", padding: "20px", borderRight: "1px solid #ddd" }}>
        <h2 style={{ marginBottom: "20px" }}>Studio</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            onClick={() => setCurrentStep("dashboard")}
            style={{ 
              padding: "10px", 
              textAlign: "left",
              fontWeight: currentStep === "dashboard" ? "bold" : "normal",
              background: currentStep === "dashboard" ? "#e0e0e0" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentStep("recipe")}
            style={{ 
              padding: "10px", 
              textAlign: "left",
              fontWeight: currentStep === "recipe" ? "bold" : "normal",
              background: currentStep === "recipe" ? "#e0e0e0" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Recipe
          </button>
          <button 
            onClick={() => setCurrentStep("timeline")}
            style={{ 
              padding: "10px", 
              textAlign: "left",
              fontWeight: currentStep === "timeline" ? "bold" : "normal",
              background: currentStep === "timeline" ? "#e0e0e0" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Timeline
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "40px", position: "relative", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
};
