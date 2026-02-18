import { getMachineList } from "@/lib/frontendData";
import MachinePageClient from "./machinePageClient";
import { requireSession } from "@/lib/require-session";

export interface ChartValue {
  time: number;
  value: number;
}

export interface MachineChartData {
  machine: string;
  values: ChartValue[];
}

interface PrometheusMetric {
  machine?: string;
  sensor?: string;
  [key: string]: any;
}

interface PrometheusResult {
  metric: PrometheusMetric;
  values: [number, string][];
}

interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: PrometheusResult[];
  };
}

export async function getMetrics(): Promise<string[]> {
  "use server";
  try {
    const host = process.env.PROMETHEUS_HOST || 'victoriametrics';
    const port = process.env.PROMETHEUS_PORT || '8428';
    const res = await fetch(`http://${host}:${port}/api/v1/label/__name__/values`, { cache: 'no-store' });
    const data = await res.json();
    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function getMachineData(machineId: string, sensorType: string): Promise<MachineChartData[]> {
  "use server";
  try {
    const host = process.env.PROMETHEUS_HOST || 'victoriametrics';
    const port = process.env.PROMETHEUS_PORT || '8428';
    const site = 'site_1'; 
    const end = Math.floor(Date.now() / 1000);
    const timeRangeHours = 120;
    const start = end - (timeRangeHours * 3600);
    const step = 3600; 
    const promQuery = `{__name__="${sensorType}", site="${site}"}`;
    const encodedQuery = encodeURIComponent(promQuery);

    const res = await fetch(
      `http://${host}:${port}/api/v1/query_range?query=${encodedQuery}&start=${start}&end=${end}&step=${step}`,
      { cache: 'no-store' }
    );
    
    const data: PrometheusResponse = await res.json();

    if (data.status === 'success' && data.data?.result && data.data.result.length > 0) {
      const normalizeString = (str: string) => (str || "").toLowerCase().replace(/[-_ ]/g, '');
      const normalizedTarget = normalizeString(machineId);
      
      const targetMachineData = data.data.result.find((result) => {
        const dbMachine = normalizeString(result.metric?.machine || "");
        const dbSensor = normalizeString(result.metric?.sensor || "");
        return dbMachine.startsWith(normalizedTarget) || dbSensor.startsWith(normalizedTarget);
      });

      const selectedData = targetMachineData || data.data.result[0];

      return [{
        machine: machineId,
        values: selectedData.values?.map((v) => ({
          time: v[0] * 1000,
          value: parseFloat(v[1])
        })) || []
      }];
    }
    return [];
  } catch (error) {
    return [];
  }
}

export default async function MachinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  await requireSession("/machine");

  const { ok, groups, machines, error } = await getMachineList();
  if (!ok) return <div>Error: {error}</div>;
  
  const resolvedSearchParams = await searchParams;
  const queriedId = Array.isArray(resolvedSearchParams?.id) 
    ? resolvedSearchParams.id[0] 
    : resolvedSearchParams?.id;

  let sensor = (resolvedSearchParams?.sensor as string) || "inlet_temperature_C";

  const metricsName = await getMetrics();
  
  if (metricsName.length > 0 && !metricsName.includes(sensor)) {
      sensor = metricsName[0];
  }

  let initialMachineId = machines?.[0]?.name || "";
  if (queriedId) {
    initialMachineId = queriedId;
  }

  const initialChartData = await getMachineData(initialMachineId, sensor);

  return (
    <MachinePageClient 
      groups={groups} 
      machines={machines} 
      initialMachineId={initialMachineId}
      initialChartData={initialChartData}
      initialSensor={sensor}
      metricsName={metricsName}
      fetchMachineData={getMachineData}
    />
  );
}