import { XCircleIcon } from "@heroicons/react/24/outline";
import "./InfoModal.css";
import { useState } from "react";
import { AppInformation } from "./AppInformation";
import { LeadsInfo } from "./LeadsInfo";

export const InfoModal = ({ setInfoModal }) => {
  const [activeSection, setActiveSection] = useState("Leads");
  return (
    <div className="info-modal">
      <div className="info-modal-overlay">
        <XCircleIcon
          className="info-modal-close-icon"
          onClick={() => setInfoModal(false)}
        />
        <div className="info-modal-container">
          <nav className="info-modal-nav">
            <p
              className={`${activeSection === "Leads" ? "selected" : "not-selected"}`}
              onClick={() => setActiveSection("Leads")}
            >
              Leads
            </p>
            <p
              onClick={() => setActiveSection("App information")}
              className={`${activeSection === "App information" ? "selected" : "not-selected"}`}
            >
              App Information
            </p>
          </nav>
          {activeSection === "App information" && <AppInformation />}
          {activeSection === "Leads" && <LeadsInfo />}
        </div>
      </div>
    </div>
  );
};
