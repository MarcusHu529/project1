import { getMachineList } from "@/lib/frontendData";
import MachinePageClient from "./machinePageClient";

export async function getMachineData(machineId: string, sensorType: string) {
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
      const normalizeString = (str: string) => (str || "").toLowerCase().replace(/[-_ ]/g, '');
      const normalizedTarget = normalizeString(machineId);
      const targetMachineData = data.data.result.find((result: any) => {
        const dbMachine = normalizeString(result.metric?.machine);
        const dbSensor = normalizeString(result.metric?.sensor);
        return dbMachine.startsWith(normalizedTarget) || dbSensor.startsWith(normalizedTarget);
      });

      if (targetMachineData) {
        return [{
          machine: machineId,
          values: targetMachineData.values?.map((v: any) => ({
            time: new Date(v[0] * 1000).toLocaleTimeString(),
            value: parseFloat(v[1])
          })) || []
        }];
      } else {
        const fallbackData = data.data.result[0];
        return [{
          machine: machineId,
          values: fallbackData.values?.map((v: any) => ({
            time: new Date(v[0] * 1000).toLocaleTimeString(),
            value: parseFloat(v[1])
          })) || []
        }];
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching machine data:', error);
    return [];
  }
}

export default async function MachinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { ok, groups, machines, error } = await getMachineList();
  if (!ok) return <div>Error: {error}</div>;
  
  const resolvedSearchParams = await searchParams;
  const queriedId = resolvedSearchParams?.id as string;

  let initialMachineId = machines?.[0]?.name || "";
  if (queriedId) {
    initialMachineId = queriedId;
  }

  const initialChartData = await getMachineData(initialMachineId, "inlet_temperature_C");

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