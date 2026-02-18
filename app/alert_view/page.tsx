import { getMachineList } from "@/lib/frontendData";
import AlertViewClient from "./alert_viewClient";
import { requireSession } from "@/lib/require-session";
import { fetchMachinePredictions } from "@/lib/actions";

export default async function AlertView() {
  await requireSession("/alert_view");

  const { ok, groups, machines, error } = await getMachineList();

  const { ok: predictionsOk, data: allAlerts } = await fetchMachinePredictions();
  if (!predictionsOk || !ok) return <div>Error: {error}</div>;

  return (
    <AlertViewClient groups={groups} machines={machines} allAlerts={allAlerts} />
  );
}
