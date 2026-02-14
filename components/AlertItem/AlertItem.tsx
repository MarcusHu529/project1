"use client";

import "./AlertItem.css";

interface AlertItemProps {
  machineName: string;
  fault: string;
  severity: string;
}

export const AlertItem = ({ machineName, fault, severity }: AlertItemProps) => {
  const styles = {
    Y2: {
      card: "alert-high",
      tag: "alert-tag-high",
      label: "Y2",
    },
    Y1: {
      card: "alert-medium",
      tag: "alert-tag-medium",
      label: "Y1",
    },
    Spike: {
      card: "alert-spike",
      tag: "alert-tag-spike",
      label: "Spike",
    },
  };

  const currentStyle = styles[severity as keyof typeof styles] || styles.Spike;

  return (
    <div className={`alert-item ${currentStyle.card}`}>
      <div className="alert-header">
        <span className="alert-name">{machineName}</span>
        <span className={`alert-tag ${currentStyle.tag}`}>
          {currentStyle.label}
        </span>
      </div>
      <p className="alert-description">{fault}</p>
    </div>
  );
};
