import { useState, useEffect, useRef, useCallback } from "react";
import LeadForm from "./LeadForm";
import "./FormContainer.css";
import { SlotSelect } from "./SlotSelect";
import logo from "../worldteams-logo-light.svg";
import { FinishModal } from "./FinishModal";
import { InfoModal } from "./InfoModal";
import { ArrowPathIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

const N8N_WEBHOOK_URL = "https://n8n.srv998702.hstgr.cloud/webhook/form-ibs-26";
const QUEUE_KEY = "ibs_queue";
const ONLINE_CHECK_INTERVAL = 10000; // 10 segundos

const EMPTY_FORM = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  companyName: "",
  takenBy: "",
  dm: "",
  temperature: "",
  organizer: "",
  comments: "",
  files: null,
};

// ─── Session helpers ──────────────────────────────────────────────────────────

const clearSession = () => {
  sessionStorage.removeItem("ibs_formData");
  sessionStorage.removeItem("ibs_step");
  sessionStorage.removeItem("ibs_slotsData");
};

// ─── Queue helpers (localStorage) ────────────────────────────────────────────

const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
};

const saveQueue = (queue) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

const pushToQueue = (entry) => {
  const queue = getQueue();
  queue.push({ id: crypto.randomUUID(), ...entry, queuedAt: Date.now() });
  saveQueue(queue);
};

const removeFromQueue = (id) => {
  const queue = getQueue().filter((item) => item.id !== id);
  saveQueue(queue);
};

// ─── Hook: online status ──────────────────────────────────────────────────────

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Eventos nativos del browser (inmediatos)
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Polling activo cada 10s: hace un fetch liviano para confirmar conectividad real
    const interval = setInterval(async () => {
      try {
        await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    }, ONLINE_CHECK_INTERVAL);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
};

// ─── Hook: background queue sync ─────────────────────────────────────────────

const useQueueSync = (isOnline) => {
  const [queueSize, setQueueSize] = useState(() => getQueue().length);
  const isSyncing = useRef(false);

  const syncQueue = useCallback(async () => {
    if (isSyncing.current) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    isSyncing.current = true;

    for (const item of queue) {
      try {
        const payload = new FormData();
        Object.entries(item.formData).forEach(([key, value]) => {
          if (value !== null && value !== "") payload.append(key, value);
        });
        payload.append("containsFiles", false);
        payload.append("scheduleAppointment", false);

        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          body: payload,
        });

        if (response.ok) removeFromQueue(item.id);
      } catch {
        // Si falla, lo deja para el próximo ciclo y corta el loop
        break;
      }

      // Espera 10s antes del siguiente, solo si quedan más items
      const remaining = getQueue();
      if (remaining.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    setQueueSize(getQueue().length);
    isSyncing.current = false;
  }, []);

  // Sincronizar cada vez que vuelve la conexión o cada 10s si hay conexión
  useEffect(() => {
    if (!isOnline) return;
    syncQueue();
    const interval = setInterval(syncQueue, ONLINE_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [isOnline, syncQueue]);

  return { queueSize, syncQueue };
};

// ─── Componente principal ─────────────────────────────────────────────────────

export const FormContainer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  const isOnline = useOnlineStatus();
  const { queueSize } = useQueueSync(isOnline);

  // Inicializar desde sessionStorage
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem("ibs_step");
    return saved ? Number(saved) : 1;
  });

  const [slotsData, setSlotsData] = useState(() => {
    const saved = sessionStorage.getItem("ibs_slotsData");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem("ibs_formData");
    return saved ? { ...JSON.parse(saved), files: null } : EMPTY_FORM;
  });

  // Sincronizar a sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      "ibs_formData",
      JSON.stringify({ ...formData, files: null }),
    );
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem("ibs_step", step);
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem("ibs_slotsData", JSON.stringify(slotsData));
  }, [slotsData]);

  // Scroll al top en cada cambio de step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Bloquear scroll con InfoModal abierto
  useEffect(() => {
    if (infoModal) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [infoModal]);

  const resetForm = () => {
    clearSession();
    setFormData(EMPTY_FORM);
    setStep(1);
    setSlotsData([]);
    setError(null);
    setSuccess(false);
    setSavedOffline(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitter = e.nativeEvent.submitter;
    const scheduleAppointment = submitter?.value === "true";

    // Validaciones
    if (!formData.firstName) return setError("'First name' is required");
    if (!formData.lastName) return setError("'Last name' is required");
    if (!formData.email) return setError("'Email' is required");
    if (!formData.companyName) return setError("'Company name' is required");
    if (!formData.takenBy) return setError("'Data taken by' is required");
    if (!formData.dm) return setError("'DM' is required");
    if (!formData.temperature) return setError("'T' is required");
    if (scheduleAppointment && !formData.organizer) {
      return setError(
        "To schedule an appointment, the 'Appointment organizer' cannot be empty",
      );
    }

    // ── Modo offline: solo "Only Submit" puede encolarse ──────────────────────
    if (!isOnline) {
      pushToQueue({ formData: { ...formData, files: null } });
      clearSession();
      setSavedOffline(true);
      setStep(3);
      return;
    }

    // ── Modo online ───────────────────────────────────────────────────────────
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") payload.append(key, value);
      });
      if (formData.files) {
        Array.from(formData.files).forEach((file) =>
          payload.append("files", file),
        );
      }
      const containsFiles = !!(formData.files && formData.files.length > 0);
      payload.append("containsFiles", containsFiles);
      payload.append("scheduleAppointment", scheduleAppointment);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) throw new Error("Error sending data");

      const result = await response.json();

      if (scheduleAppointment) {
        const slots = result.availabilty || [];
        setSlotsData(slots);
        setStep(2);
      } else {
        clearSession();
        setSavedOffline(false);
        setStep(3);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError("The form could not be submitted. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    if (step === 1) {
      return (
        <LeadForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
          isOnline={isOnline}
        />
      );
    } else if (step === 2) {
      return (
        <SlotSelect
          slotsData={slotsData}
          formData={formData}
          loading={loading}
          error={error}
          success={success}
          setError={setError}
          setLoading={setLoading}
          setSuccess={setSuccess}
          setStep={setStep}
          setFormData={setFormData}
          resetForm={resetForm}
        />
      );
    } else if (step === 3) {
      return <FinishModal savedOffline={savedOffline} resetForm={resetForm} />;
    }
  };

  return (
    <div className="form-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="header-buttons">
          {/* Status indicator */}
          <div
            className={`status-indicator ${isOnline ? "online" : "offline"}`}
          >
            {isOnline
              ? queueSize > 0
                ? `Online · syncing ${queueSize} pending`
                : "Online"
              : "Offline"}
            <span className="status-dot" />
          </div>
          <div className="reset-button orange" onClick={resetForm}>
            <ArrowPathIcon className="reset-button-icon" /> Reset Form
          </div>
          <div
            className="info-button transparent-gray"
            onClick={() => setInfoModal(true)}
          >
            <PlusCircleIcon className="info-button-icon" /> Info
          </div>
        </div>
      </div>

      {infoModal && <InfoModal setInfoModal={setInfoModal} />}
      <div className="form-subcontainer">{renderView()}</div>
    </div>
  );
};
