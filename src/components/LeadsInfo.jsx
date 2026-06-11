import { useState, useEffect } from "react";
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  CheckIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import "./LeadsInfo.css";

const N8N_GET_URL =
  "https://n8n.srv998702.hstgr.cloud/webhook/038cbbec-ab2a-41d7-ab50-e59679d312bb";
const QUEUE_KEY = "ibs_queue";

const FILTERS = [
  "All",
  "Uploaded",
  "Waiting",
  "Scheduled",
  "Dyna",
  "Male",
  "Juli",
];

const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
};

// Convierte un item de la cola (formData) al mismo shape que los items de n8n
const queueItemToLead = (item) => ({
  _id: item.id,
  _source: "queue",
  email: item.formData.email,
  first_name: item.formData.firstName,
  last_name: item.formData.lastName,
  "Company Name": item.formData.companyName,
  taken_by: item.formData.takenBy,
  scheduled_meet: false,
  _queuedAt: item.queuedAt,
});

export const LeadsInfo = () => {
  const [remoteLeads, setRemoteLeads] = useState([]);
  const [queueLeads, setQueueLeads] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  // ── Fetch remote leads ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLeads = async () => {
      setLoadingRemote(true);
      setFetchError(null);
      try {
        const response = await fetch(N8N_GET_URL);
        if (!response.ok) throw new Error("Could not fetch leads");
        const json = await response.json();
        setRemoteLeads(json.data || []);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingRemote(false);
      }
    };
    fetchLeads();
  }, []);

  // ── Read queue from localStorage ────────────────────────────────────────────
  useEffect(() => {
    const syncQueue = () => setQueueLeads(getQueue().map(queueItemToLead));
    syncQueue();
    // Re-read queue when storage changes (e.g. background sync removes items)
    window.addEventListener("storage", syncQueue);
    return () => window.removeEventListener("storage", syncQueue);
  }, []);

  // ── Merge and filter ────────────────────────────────────────────────────────
  const allLeads = [
    ...queueLeads, // waiting first
    ...remoteLeads.map((l) => ({ ...l, _source: "remote" })),
  ];

  const filtered = allLeads.filter((lead) => {
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const company = (lead["Company Name"] || "").toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(search.toLowerCase()) ||
      company.includes(search.toLowerCase());

    const TAKENBY_FILTER_MAP = {
      Dyna: "Dyna Efraimsky",
      Male: "Malena Brugger",
      Juli: "Julieta Di Cio",
    };

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Waiting" && lead._source === "queue") ||
      (activeFilter === "Uploaded" &&
        lead._source === "remote" &&
        !lead.scheduled_meet) ||
      (activeFilter === "Scheduled" &&
        lead._source === "remote" &&
        lead.scheduled_meet) ||
      (TAKENBY_FILTER_MAP[activeFilter] &&
        lead.taken_by === TAKENBY_FILTER_MAP[activeFilter]);

    return matchesSearch && matchesFilter;
  });
  const totalCount = allLeads.length;
  const filteredCount = filtered.length;
  // ── Card status helpers ─────────────────────────────────────────────────────
  const renderStatus = (lead) => {
    if (lead._source === "queue") {
      return (
        <p className="lead-status lead-status-waiting">
          <ArrowPathIcon className="lead-system-data-waiting" /> Waiting for
          sync
        </p>
      );
    }

    return (
      <p className="lead-status lead-status-ok">
        <CheckIcon className="lead-system-data-check" /> Uploaded
      </p>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="leads-info-container">
      {/* Search */}
      <div className="leads-info-search">
        <input
          className="leads-info-search-input"
          placeholder="Search lead name or company"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="leads-info-filters">
        {FILTERS.map((f) => (
          <p
            key={f}
            className={activeFilter === f ? "filter-active" : ""}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </p>
        ))}
      </div>
      <div className="leads-count">
        <span>
          {filteredCount}/{totalCount}
        </span>
      </div>
      {/* List */}
      <div className="lead-info-subcontainer">
        {loadingRemote && (
          <p className="leads-loading">
            <ArrowPathIcon className="spinning" /> Loading...
          </p>
        )}

        {fetchError && (
          <p className="leads-error">
            Could not load remote leads. Showing local data only.
          </p>
        )}
        {!loadingRemote && filtered.length === 0 && (
          <p className="leads-empty">
            <MagnifyingGlassIcon className="leads-empty-icon" /> No leads found
          </p>
        )}

        {filtered.map((lead, index) => (
          <div
            className={`lead-card ${lead.temperature?.toLowerCase() || ""}`}
            key={lead._id || lead.row_number || index}
          >
            <div className="lead-data">
              <p className="lead-name">
                <UserCircleIcon className="lead-card-user-icon" />
                {lead.first_name} {lead.last_name}
              </p>
              <p className="lead-email">
                <EnvelopeIcon className="lead-card-email-icon" />
                {lead.email}
              </p>
              <p className="lead-company">
                <BuildingOffice2Icon className="lead-card-company-icon" />
                {lead["Company Name"]}
              </p>
              <button className="lead-edit-button">Edit</button>
            </div>
            <div className="lead-card-system-data">
              {renderStatus(lead)}
              {lead.taken_by && (
                <p className="lead-taken-by">
                  <RocketLaunchIcon className="lead-system-data-rocket" />
                  By {lead.taken_by}
                </p>
              )}
              {lead.scheduled_meet && (
                <p className=" lead-status-scheduled">
                  <CalendarDaysIcon className="lead-system-data-calendar" />
                  {lead.schedule_date} · {lead.schedule_time}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
