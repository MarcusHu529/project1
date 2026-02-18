"use client";

import { useState, useMemo } from "react";
import { AlertItem } from "../components/AlertItem/AlertItem";
import { MachineList } from "../components/MachineList/MachineList";

import "./alert_view.css";

interface Machine {
  name: string;
  group_name: string;
  group_id: string;
}

interface Group {
  name: string;
  id: string;
}

interface Prediction {
  id: number;
  kind: string;
  certainty: number;
  fail_timestamp: string;
  created_at: string;
  description: string;
  machine_name: string;
}

interface Props {
  groups: Group[];
  machines: Machine[];
  allAlerts: Prediction[];
}

export default function AlertViewClient({ groups, machines, allAlerts }: Props) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const alerts = useMemo(() => {
    if (selectedMachines.length === 0) return allAlerts;
    return allAlerts.filter((alert) =>
      selectedMachines.includes(alert.machine_name),
    );
  }, [allAlerts, selectedMachines]);

  /*search bar!! simple for now, might need to add more features (note for me/Julie)*/
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const query = searchQuery.toLowerCase();
    return alerts.filter(
      (alert) =>
        alert.machine_name.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.kind.toLowerCase().includes(query)
    );
  }, [alerts, searchQuery]);

  const selectedAlert = useMemo(
    () =>
      selectedAlertId != null
        ? filteredAlerts.find((a) => a.id === selectedAlertId) ??
          filteredAlerts[0] ??
          null
        : filteredAlerts[0] ?? null,
    [filteredAlerts, selectedAlertId],
  );

  return (
    <main className="alert-page-container">
      <div className="alert-grid-layout">
        <MachineList
          groups={groups}
          machines={machines}
          selectedMachines={selectedMachines}
          onSelectMachine={(name) => {
            if (selectedMachines.includes(name)) {
              setSelectedMachines(selectedMachines.filter(m => m !== name));
            } else {
              setSelectedMachines([...selectedMachines, name]);
            }
          }}
        />

        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full px-3 py-2 text-[#616161] text-base outline-none rounded-[6px] focus:ring-1 focus:ring-[#3ba99c] placeholder:text-[#999] bg-transparent"
          />
        </div>
        <section className="alert-panel-card col-start-2 row-start-2">
          <h3 className="panel-header-title">
            Alerts {selectedMachines.length > 0 ? `— ${selectedMachines.join(', ')}` : ""}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div key={alert.id} onClick={() => setSelectedAlertId(alert.id)}>
                  <AlertItem
                    machineName={alert.machine_name}
                    fault={alert.description}
                    severity={alert.kind}
                  />
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400">
                {selectedMachines.length > 0
                  ? "No predictions found."
                  : "Select a machine."}
              </div>
            )}
          </div>
        </section>

        <section className="info-panel-card">
          <h3 className="panel-header-title">Information</h3>

          <div className="flex-1 my-5 overflow-y-auto text-[#333]">
            {selectedAlert ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[1.1rem] font-bold text-[#2b5a7a] leading-tight">
                    {selectedAlert.description}
                  </h4>
                  <p className="text-[0.75rem] text-[#999] mt-1">
                    Created:{" "}
                    {new Date(selectedAlert.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <strong>Severity:</strong> {selectedAlert.kind}
                  </div>
                  <div>
                    <strong>Certainty:</strong>{" "}
                    {(selectedAlert.certainty * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Est. Failure:</strong>{" "}
                    {selectedAlert.fail_timestamp
                      ? new Date(
                          selectedAlert.fail_timestamp,
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 italic">
                Select an alert
              </div>
            )}
          </div>

          <div className="mt-auto pt-5 border-t-2 border-[#d1d1d1]">
            <h4 className="text-[1.1rem] font-semibold text-[#2b5a7a] mb-[10px]">
              Comments:
            </h4>
            <div className="comment-box">No comments available.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
