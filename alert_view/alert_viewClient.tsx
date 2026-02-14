"use client";

import { useState, useEffect } from "react";
import { AlertItem } from "../components/AlertItem/AlertItem";
import { MachineList } from "../components/MachineList/MachineList";
import { fetchMachinePredictions } from "@/lib/actions";

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
}

export default function AlertViewClient({ groups, machines }: Props) {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Prediction | null>(null);

  useEffect(() => {
    if (!selectedMachine) return;

    const loadData = async () => {
      setLoading(true);
      const result = await fetchMachinePredictions(selectedMachine);
      if (result.ok) {
        setAlerts(result.data);
        setSelectedAlert(result.data[0] || null);
      }
      setLoading(false);
    };

    loadData();
  }, [selectedMachine]);

  return (
    <main className="alert-page-container">
      <div className="alert-grid-layout">
        <MachineList
          groups={groups}
          machines={machines}
          selectedMachine={selectedMachine}
          onSelectMachine={setSelectedMachine}
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
            Alerts {selectedMachine ? `— ${selectedMachine}` : ""}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex justify-center py-10 text-[#2b5a7a] font-medium animate-pulse">
                Fetching predictions...
              </div>
            ) : alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} onClick={() => setSelectedAlert(alert)}>
                  <AlertItem
                    machineName={alert.machine_name}
                    fault={alert.description}
                    severity={alert.kind}
                  />
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400">
                {selectedMachine
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
