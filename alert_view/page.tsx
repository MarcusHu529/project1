import { getMachineList } from "@/lib/frontendData";
import AlertViewClient from "./alert_viewClient";

export default async function AlertView() {
  const { ok, groups, machines, error } = await getMachineList();

  if (!ok) return <div>Error: {error}</div>;
  return <AlertViewClient groups={groups} machines={machines} />;
}
