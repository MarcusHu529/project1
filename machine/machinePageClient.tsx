"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { LineChart } from "../components/LineChart";
import { MachineList } from "../components/MachineList/MachineList";
import { MachineChartData } from "./page";
import "./page.css";

interface Machine {
  name: string;
  group_name: string;
  group_id: string;
}

interface Group {
  name: string;
  id: string;
}

interface Props {
  groups: Group[];
  machines: Machine[];
  initialMachineId: string;
  initialChartData: MachineChartData[];
  initialSensor: string;
  fetchMachineData: (machineId: string, sensor: string) => Promise<MachineChartData[]>;
}

const generateHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 91; i++) {
    const value = Math.floor(Math.random() * 5);
    data.push({ day: i, value });
  }
  return data;
};

export default function MachinePageClient({ groups, machines, initialMachineId, initialChartData, initialSensor, fetchMachineData }: Props) {
  const router = useRouter();
  const [selectedMachine, setSelectedMachine] = useState<string | null>(initialMachineId);
  const [sensorType, setSensorType] = useState<string>(initialSensor);
  const [chartData, setChartData] = useState<MachineChartData[]>(initialChartData);
  const [heatmapData, setHeatmapData] = useState<{day: number, value: number}[]>([]);
  const isInitialMount = useRef(true);

  const formattedChartData = useMemo(() => {
    return chartData.map(series => ({
      ...series,
      values: series.values.map(v => ({
        ...v,
        time: new Date(v.time).toLocaleTimeString()
      }))
    }));
  }, [chartData]);

  useEffect(() => {
    setSelectedMachine(initialMachineId);
    setChartData(initialChartData);
    setSensorType(initialSensor);
  }, [initialMachineId, initialChartData, initialSensor]);

  useEffect(() => {
    setHeatmapData(generateHeatmapData());
  }, [selectedMachine]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (selectedMachine) {
      fetchMachineData(selectedMachine, sensorType).then(data => setChartData(data));
    }
  }, [selectedMachine, sensorType, fetchMachineData]);

  const handleSelectMachine = (name: string) => {
    setSelectedMachine(name);
    router.push(`/machine?id=${encodeURIComponent(name)}&sensor=${sensorType}`);
  };

  const handleSensorChange = (sensor: string) => {
    setSensorType(sensor);
    router.push(`/machine?id=${encodeURIComponent(selectedMachine || "")}&sensor=${sensor}`);
  };

  const getColorClass = (value: number) => {
    switch (value) {
      case 1: return "bg-[#d1e1f0]";
      case 2: return "bg-[#9FBFD7]";
      case 3: return "bg-[#35699f]";
      case 4: return "bg-[#1a3a5f]";
      default: return "bg-[#ebedf0]";
    }
  };

  return (
    <main className="dashboard">
      <div className="main-container">
        <aside className="machine-sidebar">
          <MachineList 
            groups={groups}
            machines={machines}
            selectedMachine={selectedMachine}
            onSelectMachine={handleSelectMachine}
          />
        </aside>
        <section className="machine-content">
          <div className="machine-header-title">{selectedMachine || 'Select a machine'}</div>
          
          <div className="content-top-row">
            <div className="widget live-data-widget">
              <h2>Live Data</h2>
              <div className="chart-container">
                  <LineChart chartData={formattedChartData} />
              </div>
              <div className="sensor-selector">
                <label>Sensor :</label>
                <select value={sensorType} onChange={(e) => handleSensorChange(e.target.value)}>
                  <option value="inlet_temperature_C">Inlet Temperature</option>
                  <option value="vibration">Vibration</option>
                  <option value="pressure">Pressure</option>
                </select>
              </div>
            </div>

            <div className="stats-column">
              <div className="prediction-grid">
                <div className="prediction-box purple">
                  <span className="label">Predicted Failure</span>
                  <span className="value">12d</span>
                  <span className="sub-label">Potential Breakdown</span>
                </div>
                <div className="prediction-box light-gray issues-box">
                  <span className="label">Top 3 Historical Breakdowns</span>
                  <ol>
                    <li>1. Leakage - 65%</li>
                    <li>2. Motor Breakdown - 45%</li>
                    <li>3. Heat Damage - 30%</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="content-bottom-row">
            <div className="widget alert-history">
              <div className="widget-header">
                <h2>Alert History</h2> 
                <button className="edit-btn">Edit</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>03-14-2026</td>
                    <td>15:12:09</td>
                    <td>Temperature spike detected</td>
                    <td>Low</td>
                    <td>77%</td>
                  </tr>
                  <tr>
                    <td>05-20-2025</td>
                    <td>12:09:33</td>
                    <td>Vibration anomaly</td>
                    <td>Low</td>
                    <td>80%</td>
                  </tr>
                  <tr>
                    <td>05-20-2025</td>
                    <td>12:09:33</td>
                    <td>Vibration anomaly</td>
                    <td>Low</td>
                    <td>80%</td>
                  </tr>
                  <tr>
                    <td>05-20-2025</td>
                    <td>12:09:33</td>
                    <td>Vibration anomaly</td>
                    <td>Low</td>
                    <td>80%</td>
                  </tr>
                  <tr>
                    <td>05-20-2025</td>
                    <td>12:09:33</td>
                    <td>Vibration anomaly</td>
                    <td>Low</td>
                    <td>80%</td>
                  </tr>
                  <tr>
                    <td>05-20-2025</td>
                    <td>12:09:33</td>
                    <td>Vibration anomaly</td>
                    <td>Low</td>
                    <td>80%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="widget common-issues-heatmap">
              <div className="heatmap-header">
                <h2>Breakdown Frequency (Last 90 Days)</h2>
              </div>
              <div className="heatmap-grid-container">
                <div className="heatmap-grid">
                  {heatmapData.map((data) => (
                    <div
                      key={data.day}
                      className={`heatmap-cell ${getColorClass(data.value)}`}
                      title={`Activity level: ${data.value}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}