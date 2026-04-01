"use client";

import { useState } from "react";
import { WaterLevelStatus } from "@prisma/client";
import { useSubmit } from "@/components/forms/use-submit";

type ChecklistItem = { id: string; label: string; completed: boolean; required: boolean };

type ChemicalEntry = {
  chemicalType: string;
  dosageAmount: number;
  dosageUnit: string;
  costPerUnit: number;
  phReading?: number | "";
  chlorineReading?: number | "";
  alkalinityReading?: number | "";
  notes?: string;
};

type IncidentEntry = { title: string; details: string; severity: string };

export function TechnicianJobExecution({
  jobId,
  checklistItems,
  defaultSummary,
}: {
  jobId: string;
  checklistItems: ChecklistItem[];
  defaultSummary?: string;
}) {
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>(checklistItems.filter((item) => item.completed).map((item) => item.id));
  const [summary, setSummary] = useState(defaultSummary ?? "");
  const [observations, setObservations] = useState("");
  const [waterLevelStatus, setWaterLevelStatus] = useState<WaterLevelStatus>(WaterLevelStatus.NORMAL);
  const [chemicalEntries, setChemicalEntries] = useState<ChemicalEntry[]>([
    { chemicalType: "Liquid chlorine", dosageAmount: 1, dosageUnit: "gal", costPerUnit: 6.5, phReading: 7.4, chlorineReading: 2.1, alkalinityReading: 100, notes: "" },
  ]);
  const [incidentEntries, setIncidentEntries] = useState<IncidentEntry[]>([]);
  const { submit, isPending, error, success } = useSubmit();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Checklist</h3>
        <div className="mt-4 space-y-3">
          {checklistItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                checked={selectedChecklistIds.includes(item.id)}
                onChange={(event) => {
                  setSelectedChecklistIds((current) =>
                    event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id),
                  );
                }}
              />
              <span className="text-sm text-slate-700">{item.label}{item.required ? " *" : ""}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Service log</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Observations</label>
            <textarea value={observations} onChange={(event) => setObservations(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Water level status</label>
            <select value={waterLevelStatus} onChange={(event) => setWaterLevelStatus(event.target.value as WaterLevelStatus)}>
              {Object.values(WaterLevelStatus).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Chemical logs</h3>
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
            onClick={() => setChemicalEntries((current) => [...current, { chemicalType: "", dosageAmount: 0, dosageUnit: "lb", costPerUnit: 0 }])}
          >
            Add chemical
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {chemicalEntries.map((entry, index) => (
            <div key={`${entry.chemicalType}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-4">
              <input placeholder="Chemical type" value={entry.chemicalType} onChange={(event) => updateChemical(index, "chemicalType", event.target.value)} />
              <input type="number" placeholder="Dosage" value={entry.dosageAmount} onChange={(event) => updateChemical(index, "dosageAmount", Number(event.target.value))} />
              <input placeholder="Unit" value={entry.dosageUnit} onChange={(event) => updateChemical(index, "dosageUnit", event.target.value)} />
              <input type="number" step="0.01" placeholder="Cost per unit" value={entry.costPerUnit} onChange={(event) => updateChemical(index, "costPerUnit", Number(event.target.value))} />
              <input type="number" step="0.1" placeholder="pH" value={entry.phReading ?? ""} onChange={(event) => updateChemical(index, "phReading", event.target.value === "" ? "" : Number(event.target.value))} />
              <input type="number" step="0.1" placeholder="Chlorine" value={entry.chlorineReading ?? ""} onChange={(event) => updateChemical(index, "chlorineReading", event.target.value === "" ? "" : Number(event.target.value))} />
              <input type="number" step="0.1" placeholder="Alkalinity" value={entry.alkalinityReading ?? ""} onChange={(event) => updateChemical(index, "alkalinityReading", event.target.value === "" ? "" : Number(event.target.value))} />
              <input placeholder="Notes" value={entry.notes ?? ""} onChange={(event) => updateChemical(index, "notes", event.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Incidents</h3>
          <button
            type="button"
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
            onClick={() => setIncidentEntries((current) => [...current, { title: "", details: "", severity: "Medium" }])}
          >
            Add incident
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {incidentEntries.length === 0 ? <p className="text-sm text-slate-500">No incidents recorded for this visit.</p> : null}
          {incidentEntries.map((entry, index) => (
            <div key={`${entry.title}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-3">
              <input placeholder="Title" value={entry.title} onChange={(event) => updateIncident(index, "title", event.target.value)} />
              <input placeholder="Severity" value={entry.severity} onChange={(event) => updateIncident(index, "severity", event.target.value)} />
              <textarea className="md:col-span-3" placeholder="Details" value={entry.details} onChange={(event) => updateIncident(index, "details", event.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">Job submitted successfully.</p> : null}
      <button
        type="button"
        disabled={isPending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        onClick={() =>
          submit(`/api/jobs/${jobId}/execute`, {
            checklistCompletedIds: selectedChecklistIds,
            summary,
            observations,
            waterLevelStatus,
            chemicalEntries: chemicalEntries.filter((entry) => entry.chemicalType),
            incidentEntries: incidentEntries.filter((entry) => entry.title),
          })
        }
      >
        {isPending ? "Submitting..." : "Complete service job"}
      </button>
    </div>
  );

  function updateChemical<K extends keyof ChemicalEntry>(index: number, key: K, value: ChemicalEntry[K]) {
    setChemicalEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: value } : entry));
  }

  function updateIncident<K extends keyof IncidentEntry>(index: number, key: K, value: IncidentEntry[K]) {
    setIncidentEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, [key]: value } : entry));
  }
}
