import { getMachineList } from "@/lib/frontendData";
import MachinePageClient from "./machinePageClient";

export async function getMachineData(machineId: string, sensorType: string, unit: string) {
  "use server";
  try {
    const host = process.env.PROMETHEUS_HOST || 'victoriametrics';
    const port = process.env.PROMETHEUS_PORT || '8428';
    const site = 'site_1';
    const end = Math.floor(Date.now() / 1000);
    const start = end - 3600;
    const step = 240; 
    
    const res = await fetch(
      `http://${host}:${port}/api/v1/query_range?query=${sensorType}{site="${site}"}&start=${start}&end=${end}&step=${step}`,
      { cache: 'no-store' }
    );
    
    const data = await res.json();
    if (data.status === 'success' && data.data?.result && data.data.result.length > 0) {
      return data.data.result.map((result: any) => ({
        machine: result.metric?.machine || result.metric?.sensor || machineId,
        values: result.values?.map((v: any) => ({
          time: new Date(v[0] * 1000).toLocaleTimeString(),
          value: parseFloat(v[1])
        })) || []
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

export default async function MachinePage() {
  const { ok, groups, machines, error } = await getMachineList();
  if (!ok) return <div>Error: {error}</div>;
  
  const initialMachineId = machines?.[0]?.name || "";
  const initialChartData = await getMachineData(initialMachineId, "inlet_temperature_C", "metric");

  return (
    <MachinePageClient 
      groups={groups} 
      machines={machines} 
      initialMachineId={initialMachineId}
      initialChartData={initialChartData}
      fetchMachineData={getMachineData}
    />
  );
}