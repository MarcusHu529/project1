import { DonutChart } from "./components/DonutChart/DonutChart";
import { MachineItem } from "./components/MachineItem/MachineItem";
import { AlertItem } from "./components/AlertItem/AlertItem";
import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { pool } from "@/lib/db";

import "./page.css";

async function getMachineData() {
  const query = `
    SELECT
      m.id,
      m.name,
      m.site_id,
      COALESCE(p.kind, 'GOOD') as latest_status
    FROM machines m
    LEFT JOIN (
      SELECT DISTINCT ON (machine_id) machine_id, kind
      FROM predictions
      ORDER BY machine_id, created_at DESC
    ) p ON m.id = p.machine_id
    ORDER BY m.id ASC
  `;

  try {
    const { rows } = await pool.query(query);

    return rows.map((machine, index) => ({
      id: index + 1,
      name: machine.name,
      zone: machine.site_id,
      status: machine.latest_status,
    }));
  } catch (err) {
    console.error("Error fetching machine data:", err);
    return [];
  }
}

async function getDonutData() {
  const query = `
    SELECT
        COALESCE(p.kind, 'GOOD') as status,
        COUNT(*)::int as value
    FROM machines m
    LEFT JOIN (
        SELECT DISTINCT ON (machine_id) machine_id, kind
        FROM predictions
        ORDER BY machine_id, created_at DESC
    ) p ON m.id = p.machine_id
    GROUP BY status;
  `;

  try {
    const { rows } = await pool.query(query);
    const counts = Object.fromEntries(rows.map((r) => [r.status, r.value]));

    // Convert notification "kind" from sheet to display name
    const order = [
      { key: "GOOD", label: "Stable" },
      { key: "Y2", label: "Y2" },
      { key: "Y1", label: "Y1" },
      { key: "Spike", label: "Spikes" },
    ];

    return order.map((item) => ({
      machine: item.label,
      value: counts[item.key] || 0,
    }));
  } catch (err) {
    console.error("Donut Query Error:", err);
    return [
      { machine: "Stable", value: 0 },
      { machine: "Y2", value: 0 },
      { machine: "Y1", value: 0 },
      { machine: "Spikes", value: 0 },
    ];
  }
}

async function getAlerts() {
  const query = `
    SELECT DISTINCT ON (p.machine_id)
        m.name as machine_name,
        p.kind as severity,
        p.created_at
    FROM predictions p
    JOIN machines m ON p.machine_id = m.id
    WHERE p.kind != 'GOOD'
    ORDER BY p.machine_id, p.created_at DESC;
  `;

  try {
    const { rows } = await pool.query(query);

    return rows.map((alert) => ({
      machineName: alert.machine_name,
      fault: "NA", // needs to be implemented into the DB
      severity: alert.severity,
    }));
  } catch (err) {
    console.error("Alerts Query Error:", err);
    return [];
  }
}

export default async function Dashboard() {
  await requireSession("/");

  const machines = await getMachineData();
  const status_counts = await getDonutData();
  const predictions = await getAlerts();

  return (
    <main className="dashboard">
      <div className="bento-grid">
        <div className="overview-card">
          <h2 className="card-title">Overview</h2>
          <div className="overview-content">
            <div className="overview-stats">
              <div className="stat-box">
                <span className="stat-label">Equipment Uptime</span>
                <span className="stat-value">93.7%</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">High Priority Alerts</span>
                <span className="stat-value">7</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Last Failure</span>
                <span className="stat-value">2d</span>
                <span className="stat-detail">Extruder 21 - Leak</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Predicted Downtime</span>
                <span className="stat-value">3h</span>
              </div>
            </div>
            <div className="overview-chart">
              <div className="piechart">
                <DonutChart chartData={status_counts} />
              </div>
            </div>
          </div>
          <div className="overview-content-mobile h-40">
            <div className="overview-content-mobile-chips aspect-square bg-[#9FD2FF] text-[#1a3a5f] p-2">
              <span className="text-8xl font-bold leading-none">3</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-center leading-tight">
                Action Items
              </span>
            </div>
            <div className="overview-content-mobile-chips flex-1 bg-gray-50 p-1">
              <DonutChart chartData={status_counts} position={"bottom"} />
            </div>
          </div>
        </div>

        <div className="alerts-card">
          <h2 className="card-title">Alerts</h2>
          <div className="alerts-list">
            {predictions.length > 0 ? (
              predictions.map((alert, index) => (
                <AlertItem
                  key={index}
                  machineName={alert.machineName}
                  fault={alert.fault}
                  severity={alert.severity}
                />
              ))
            ) : (
              <p className="no-alerts">No active alerts</p>
            )}
          </div>
        </div>
        <div className="machines-card">
          <h2 className="card-title">Machines</h2>
          <div className="machines-list">
            {machines.map((machine) => (
              <MachineItem key={machine.id} machine={machine}></MachineItem>
            ))}
          </div>
        </div>
        <div className="model-card">
          <h2 className="card-title">Prediction Stats</h2>
          <div className="model-stats">
            <div className="stat-box">
              <span className="stat-label">Days Since Last Train</span>
              <span className="stat-value">253</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Model Accuracy</span>
              <span className="stat-value">67%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
