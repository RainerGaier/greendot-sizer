import React, { useMemo, useState } from "react";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-slate-200 p-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-lg font-semibold text-slate-800 ${className}`}>{children}</h2>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${className}`}
  />
);

const Label = ({ children, className = "", ...props }) => (
  <label {...props} className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);

const Slider = ({ value, min, max, step, onValueChange }) => (
  <input
    type="range"
    value={value[0]}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onValueChange([Number(e.target.value)])}
    className="w-full accent-green-600"
  />
);

const Switch = ({ checked, onCheckedChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
      checked ? "bg-green-600" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Printer, Database, Gauge, HardDrive, Layers3, Activity } from "lucide-react";

const DAYS_PER_MONTH = 30.4375;
const DAYS_PER_YEAR = 365.25;

const formatNumber = (value, decimals = 0) =>
  new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${formatNumber(size, unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

const telemetryRows = [
  { metric: "Main Voltage (L-N RMS)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Backup Voltage (L-N RMS)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Main Voltage Peak", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Backup Voltage Peak", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Neutral-Earth Voltage", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Bus Voltage RMS", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Frequency (Main)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Frequency (Backup)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "DC Offset", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Total Current", instances: 1, sqlType: "INT", bytesEach: 4, tier: "Medium" },
  { metric: "Outlet Current (1–14)", instances: 14, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Total Power", instances: 1, sqlType: "INT", bytesEach: 4, tier: "Medium" },
  { metric: "Outlet Power (1–14)", instances: 14, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Earth Leakage (Main)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },
  { metric: "Earth Leakage (Backup)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Medium" },

  { metric: "Relay Expected State", instances: 14, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Outlet Measured State", instances: 14, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Fuse Status", instances: 14, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Main Fuse Status", instances: 1, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Backup Fuse Status", instances: 1, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Cycle Timer Active", instances: 1, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Cycle Timer Remaining", instances: 14, sqlType: "TINYINT", bytesEach: 1, tier: "Fast" },
  { metric: "Unit Alarm State", instances: 1, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Changeover State", instances: 1, sqlType: "BIT", bytesEach: 1, tier: "Fast" },

  { metric: "Internal Temperature", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Slow" },
  { metric: "Internal Temp Min", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Slow" },
  { metric: "Internal Temp Max", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Slow" },
  { metric: "External Temp (1-wire)", instances: 1, sqlType: "SMALLINT", bytesEach: 2, tier: "Slow" },
  { metric: "External Humidity", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "PSU Voltage (Main Board)", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "PSU Voltage Min", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "PSU Voltage Max", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "Ethernet Board Voltage", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "PoE Voltage", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },

  { metric: "GPI Current State (1–4)", instances: 4, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "GPI Rising Edge", instances: 4, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "GPI Falling Edge", instances: 4, sqlType: "BIT", bytesEach: 1, tier: "Fast" },
  { metric: "Front Panel Switch State", instances: 1, sqlType: "BIT", bytesEach: 1, tier: "Fast" },

  { metric: "Current Macro Address", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "Macro Timer Remaining", instances: 1, sqlType: "INT", bytesEach: 4, tier: "Slow" },
  { metric: "Counter1", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
  { metric: "Counter2", instances: 1, sqlType: "TINYINT", bytesEach: 1, tier: "Slow" },
];

const presets = {
  conservative: {
    mode: "simple",
    pduCount: 50,
    pollIntervalSec: 30,
    metadataBytes: 28,
    sqlRowOverheadBytes: 24,
    indexOverheadPct: 20,
    compressionPct: 0,
    parsedCopyFactor: 1,
    retentionYears: 1,
    growthHeadroomPct: 15,
    replicaFactor: 1,
    backupFactor: 1,
    fastPollSec: 10,
    mediumPollSec: 30,
    slowPollSec: 60,
  },
  recommended: {
    mode: "simple",
    pduCount: 100,
    pollIntervalSec: 15,
    metadataBytes: 28,
    sqlRowOverheadBytes: 24,
    indexOverheadPct: 30,
    compressionPct: 0,
    parsedCopyFactor: 1,
    retentionYears: 1,
    growthHeadroomPct: 20,
    replicaFactor: 1,
    backupFactor: 1,
    fastPollSec: 10,
    mediumPollSec: 30,
    slowPollSec: 60,
  },
  realistic: {
    mode: "advanced",
    pduCount: 100,
    pollIntervalSec: 15,
    metadataBytes: 28,
    sqlRowOverheadBytes: 24,
    indexOverheadPct: 30,
    compressionPct: 0,
    parsedCopyFactor: 1,
    retentionYears: 2,
    growthHeadroomPct: 20,
    replicaFactor: 1,
    backupFactor: 1,
    fastPollSec: 10,
    mediumPollSec: 30,
    slowPollSec: 60,
  },
  heavy: {
    mode: "advanced",
    pduCount: 250,
    pollIntervalSec: 15,
    metadataBytes: 28,
    sqlRowOverheadBytes: 24,
    indexOverheadPct: 35,
    compressionPct: 10,
    parsedCopyFactor: 1.5,
    retentionYears: 3,
    growthHeadroomPct: 25,
    replicaFactor: 2,
    backupFactor: 1.2,
    fastPollSec: 5,
    mediumPollSec: 30,
    slowPollSec: 60,
  },
};

const totalTelemetryBytes = telemetryRows.reduce(
  (sum, row) => sum + row.instances * row.bytesEach,
  0
);

const tierPayloads = telemetryRows.reduce(
  (acc, row) => {
    acc[row.tier] += row.instances * row.bytesEach;
    return acc;
  },
  { Fast: 0, Medium: 0, Slow: 0 }
);

const scenarioGridPdus = [10, 50, 100, 250, 500];
const scenarioGridPolls = [5, 10, 15, 20, 30, 60];

const KPI = ({ title, value, subtext, icon: Icon }) => (
  <Card className="rounded-2xl shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function GreenDotSqlSizingCalculator() {
  const [form, setForm] = useState(presets.recommended);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [activePreset, setActivePreset] = useState("recommended");

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setActivePreset(null);
  };

  const applyPreset = (presetKey) => {
    setForm(presets[presetKey]);
    setActivePreset(presetKey);
  };

  const sizing = useMemo(() => {
    const indexFactor = 1 + form.indexOverheadPct / 100;
    const compressionFactor = 1 - form.compressionPct / 100;
    const sharedFixedBytes = form.metadataBytes + form.sqlRowOverheadBytes;

    const simpleBaseRecordBytes = totalTelemetryBytes + sharedFixedBytes;
    const simpleEffectiveRecordBytes = simpleBaseRecordBytes * compressionFactor * form.parsedCopyFactor * indexFactor;

    const simpleRecordsPerHour = form.pduCount * (3600 / form.pollIntervalSec);
    const simpleRecordsPerDay = simpleRecordsPerHour * 24;
    const simpleRecordsPerYear = simpleRecordsPerDay * DAYS_PER_YEAR;

    const simpleBytesPerHour = simpleRecordsPerHour * simpleEffectiveRecordBytes;
    const simpleBytesPerDay = simpleRecordsPerDay * simpleEffectiveRecordBytes;
    const simpleBytesPerYear = simpleRecordsPerYear * simpleEffectiveRecordBytes;

    const fastRecordBytes = (tierPayloads.Fast + sharedFixedBytes) * compressionFactor * form.parsedCopyFactor * indexFactor;
    const mediumRecordBytes = (tierPayloads.Medium + sharedFixedBytes) * compressionFactor * form.parsedCopyFactor * indexFactor;
    const slowRecordBytes = (tierPayloads.Slow + sharedFixedBytes) * compressionFactor * form.parsedCopyFactor * indexFactor;

    const fastRecordsPerHour = form.pduCount * (3600 / form.fastPollSec);
    const mediumRecordsPerHour = form.pduCount * (3600 / form.mediumPollSec);
    const slowRecordsPerHour = form.pduCount * (3600 / form.slowPollSec);

    const advancedRecordsPerHour = fastRecordsPerHour + mediumRecordsPerHour + slowRecordsPerHour;
    const advancedRecordsPerDay = advancedRecordsPerHour * 24;
    const advancedRecordsPerYear = advancedRecordsPerDay * DAYS_PER_YEAR;

    const advancedBytesPerHour =
      fastRecordsPerHour * fastRecordBytes +
      mediumRecordsPerHour * mediumRecordBytes +
      slowRecordsPerHour * slowRecordBytes;
    const advancedBytesPerDay = advancedBytesPerHour * 24;
    const advancedBytesPerYear = advancedBytesPerDay * DAYS_PER_YEAR;

    const selectedModeBytesPerYear = form.mode === "simple" ? simpleBytesPerYear : advancedBytesPerYear;
    const retainedBytes = selectedModeBytesPerYear * form.retentionYears;
    const retainedWithHeadroom = retainedBytes * (1 + form.growthHeadroomPct / 100);
    const provisionedBytes = retainedWithHeadroom * form.replicaFactor * form.backupFactor;

    return {
      sharedFixedBytes,
      simpleBaseRecordBytes,
      simpleEffectiveRecordBytes,
      simpleRecordsPerHour,
      simpleRecordsPerDay,
      simpleRecordsPerYear,
      simpleBytesPerHour,
      simpleBytesPerDay,
      simpleBytesPerYear,
      fastRecordBytes,
      mediumRecordBytes,
      slowRecordBytes,
      fastRecordsPerHour,
      mediumRecordsPerHour,
      slowRecordsPerHour,
      advancedRecordsPerHour,
      advancedRecordsPerDay,
      advancedRecordsPerYear,
      advancedBytesPerHour,
      advancedBytesPerDay,
      advancedBytesPerYear,
      retainedBytes,
      retainedWithHeadroom,
      provisionedBytes,
    };
  }, [form]);

  const comparisonData = [
    {
      name: "Per Hour",
      Simple: Math.round(sizing.simpleBytesPerHour),
      Advanced: Math.round(sizing.advancedBytesPerHour),
    },
    {
      name: "Per Day",
      Simple: Math.round(sizing.simpleBytesPerDay),
      Advanced: Math.round(sizing.advancedBytesPerDay),
    },
    {
      name: "Per Year",
      Simple: Math.round(sizing.simpleBytesPerYear),
      Advanced: Math.round(sizing.advancedBytesPerYear),
    },
  ];

  const retentionData = Array.from({ length: Math.max(1, form.retentionYears) }, (_, i) => {
    const year = i + 1;
    const yearlyBytes = (form.mode === "simple" ? sizing.simpleBytesPerYear : sizing.advancedBytesPerYear) * year;
    const withHeadroom = yearlyBytes * (1 + form.growthHeadroomPct / 100);
    const provisioned = withHeadroom * form.replicaFactor * form.backupFactor;
    return {
      year: `Y${year}`,
      Retained: Math.round(yearlyBytes),
      Provisioned: Math.round(provisioned),
    };
  });

  const scenarioMatrix = scenarioGridPdus.map((pdu) => {
    const row = { pdu };
    scenarioGridPolls.forEach((poll) => {
      const base = totalTelemetryBytes + form.metadataBytes + form.sqlRowOverheadBytes;
      const bytesPerRecord = base * (1 - form.compressionPct / 100) * form.parsedCopyFactor * (1 + form.indexOverheadPct / 100);
      const yearlyBytes = pdu * (86400 / poll) * DAYS_PER_YEAR * bytesPerRecord;
      row[`poll_${poll}`] = yearlyBytes;
    });
    return row;
  });

  const selectedBytesPerYear = form.mode === "simple" ? sizing.simpleBytesPerYear : sizing.advancedBytesPerYear;
  const selectedRecordsPerHour = form.mode === "simple" ? sizing.simpleRecordsPerHour : sizing.advancedRecordsPerHour;

  const packetBreakdown = [
    { label: "Telemetry Payload", bytes: totalTelemetryBytes },
    { label: "Metadata", bytes: form.metadataBytes },
    { label: "SQL Row Overhead", bytes: form.sqlRowOverheadBytes },
  ];

  const selectedTierData = [
    {
      tier: "Fast",
      poll: `${form.fastPollSec}s`,
      payload: tierPayloads.Fast,
      hourlyRecords: sizing.fastRecordsPerHour,
      hourlyBytes: sizing.advancedBytesPerHour === 0 ? 0 : sizing.fastRecordsPerHour * sizing.fastRecordBytes,
    },
    {
      tier: "Medium",
      poll: `${form.mediumPollSec}s`,
      payload: tierPayloads.Medium,
      hourlyRecords: sizing.mediumRecordsPerHour,
      hourlyBytes: sizing.advancedBytesPerHour === 0 ? 0 : sizing.mediumRecordsPerHour * sizing.mediumRecordBytes,
    },
    {
      tier: "Slow",
      poll: `${form.slowPollSec}s`,
      payload: tierPayloads.Slow,
      hourlyRecords: sizing.slowRecordsPerHour,
      hourlyBytes: sizing.advancedBytesPerHour === 0 ? 0 : sizing.slowRecordsPerHour * sizing.slowRecordBytes,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
      <div className="mx-auto max-w-7xl p-4 md:p-6 print:max-w-none print:p-6">
        <div className="mb-6 flex flex-col gap-4 print:mb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full bg-green-600 inline-block shrink-0" />
                <span className="text-2xl font-bold text-green-600 tracking-tight">GreenDot</span>
                <span className="text-2xl font-semibold text-slate-700 tracking-tight">SQL Sizing Calculator</span>
              </div>
              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                eyePower PDU — SQL Storage Sizing &amp; Scenario Planner
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              {[
                { key: "conservative", label: "Conservative" },
                { key: "recommended", label: "Recommended" },
                { key: "realistic", label: "Realistic Advanced" },
                { key: "heavy", label: "Heavy Retention" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={activePreset === key ? "!bg-green-600 !text-white !border-green-600 hover:!bg-green-700" : ""}
                >
                  {label}
                </Button>
              ))}
              <Button onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" />
                Print to PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)] print:grid-cols-1">
          <div className="space-y-6 print:hidden">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Scenario Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Advanced tiered mode</Label>
                    <Switch checked={form.mode === "advanced"} onCheckedChange={(checked) => update("mode", checked ? "advanced" : "simple")} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Simple mode uses one blended packet per poll. Advanced mode sizes fast, medium, and slow telemetry tiers separately.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Number of PDUs</Label>
                    <span className="text-sm font-medium">{formatNumber(form.pduCount)}</span>
                  </div>
                  <Slider value={[form.pduCount]} min={1} max={1000} step={1} onValueChange={([v]) => update("pduCount", v)} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Simple polling interval</Label>
                    <span className="text-sm font-medium">{form.pollIntervalSec}s</span>
                  </div>
                  <Slider value={[form.pollIntervalSec]} min={5} max={120} step={1} onValueChange={([v]) => update("pollIntervalSec", v)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Fast poll</Label>
                      <span className="text-sm font-medium">{form.fastPollSec}s</span>
                    </div>
                    <Slider value={[form.fastPollSec]} min={1} max={30} step={1} onValueChange={([v]) => update("fastPollSec", v)} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Medium poll</Label>
                      <span className="text-sm font-medium">{form.mediumPollSec}s</span>
                    </div>
                    <Slider value={[form.mediumPollSec]} min={5} max={120} step={1} onValueChange={([v]) => update("mediumPollSec", v)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Slow poll</Label>
                    <span className="text-sm font-medium">{form.slowPollSec}s</span>
                  </div>
                  <Slider value={[form.slowPollSec]} min={10} max={300} step={5} onValueChange={([v]) => update("slowPollSec", v)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metadataBytes">Metadata bytes</Label>
                    <Input id="metadataBytes" type="number" value={form.metadataBytes} onChange={(e) => update("metadataBytes", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sqlRowOverheadBytes">SQL row overhead</Label>
                    <Input id="sqlRowOverheadBytes" type="number" value={form.sqlRowOverheadBytes} onChange={(e) => update("sqlRowOverheadBytes", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indexOverheadPct">Index overhead %</Label>
                    <Input id="indexOverheadPct" type="number" value={form.indexOverheadPct} onChange={(e) => update("indexOverheadPct", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compressionPct">Compression %</Label>
                    <Input id="compressionPct" type="number" value={form.compressionPct} onChange={(e) => update("compressionPct", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parsedCopyFactor">Parsed copy factor</Label>
                    <Input id="parsedCopyFactor" type="number" step="0.1" value={form.parsedCopyFactor} onChange={(e) => update("parsedCopyFactor", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionYears">Retention years</Label>
                    <Input id="retentionYears" type="number" value={form.retentionYears} onChange={(e) => update("retentionYears", Math.max(1, Number(e.target.value) || 1))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="growthHeadroomPct">Growth headroom %</Label>
                    <Input id="growthHeadroomPct" type="number" value={form.growthHeadroomPct} onChange={(e) => update("growthHeadroomPct", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replicaFactor">Replica factor</Label>
                    <Input id="replicaFactor" type="number" step="0.1" value={form.replicaFactor} onChange={(e) => update("replicaFactor", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="backupFactor">Backup factor</Label>
                    <Input id="backupFactor" type="number" step="0.1" value={form.backupFactor} onChange={(e) => update("backupFactor", Number(e.target.value) || 0)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KPI title="Active Mode" value={form.mode === "simple" ? "Simple" : "Advanced"} subtext={form.mode === "simple" ? `${form.pollIntervalSec}s average interval` : `Fast ${form.fastPollSec}s / Medium ${form.mediumPollSec}s / Slow ${form.slowPollSec}s`} icon={Gauge} />
              <KPI title="Records per Hour" value={formatNumber(selectedRecordsPerHour)} subtext={`${formatNumber(form.pduCount)} PDUs`} icon={Database} />
              <KPI title="Annual Storage" value={formatBytes(selectedBytesPerYear)} subtext="Before retention expansion" icon={HardDrive} />
              <KPI title="Provisioned Footprint" value={formatBytes(sizing.provisionedBytes)} subtext="Retention, headroom, replica, backup" icon={Layers3} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Simple vs Advanced Comparison</CardTitle>
                </CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatBytes(value)} width={90} />
                      <Tooltip formatter={(value) => formatBytes(value)} />
                      <Legend />
                      <Bar dataKey="Simple" fill="#16a34a" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Advanced" fill="#0f172a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Retention Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => formatBytes(value)} width={90} />
                      <Tooltip formatter={(value) => formatBytes(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="Retained" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Provisioned" stroke="#0f172a" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="rounded-2xl shadow-sm lg:col-span-1">
                <CardHeader>
                  <CardTitle>Packet Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {packetBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border p-3">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium">{item.bytes} bytes</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl border border-dashed p-3 font-medium">
                    <span>Total logical payload</span>
                    <span>{totalTelemetryBytes} bytes</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle>Advanced Tier Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {selectedTierData.map((tier) => (
                      <div key={tier.tier} className="rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{tier.tier}</h3>
                          <span className="text-xs text-slate-500">{tier.poll}</span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Payload</span>
                            <span>{tier.payload} bytes</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Hourly records</span>
                            <span>{formatNumber(tier.hourlyRecords)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Hourly storage</span>
                            <span>{formatBytes(tier.hourlyBytes)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Scenario Matrix — Annual Storage (Simple Mode Basis)</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border-b px-3 py-2 text-left">PDUs</th>
                      {scenarioGridPolls.map((poll) => (
                        <th key={poll} className="border-b px-3 py-2 text-right">{poll}s</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioMatrix.map((row) => (
                      <tr key={row.pdu}>
                        <td className="border-b px-3 py-2 font-medium">{row.pdu}</td>
                        {scenarioGridPolls.map((poll) => (
                          <td key={poll} className="border-b px-3 py-2 text-right">{formatBytes(Number(row[`poll_${poll}`]))}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Telemetry Catalogue</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowTelemetry((prev) => !prev)}>
                    {showTelemetry ? "Hide" : "Show"}
                  </Button>
                </div>
              </CardHeader>
              {showTelemetry ? (
                <CardContent className="overflow-x-auto">
                  <table className="w-full min-w-[880px] border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border-b px-3 py-2 text-left">Metric</th>
                        <th className="border-b px-3 py-2 text-left">Tier</th>
                        <th className="border-b px-3 py-2 text-left">SQL Type</th>
                        <th className="border-b px-3 py-2 text-right">Instances</th>
                        <th className="border-b px-3 py-2 text-right">Bytes each</th>
                        <th className="border-b px-3 py-2 text-right">Total bytes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {telemetryRows.map((row) => (
                        <tr key={row.metric}>
                          <td className="border-b px-3 py-2">{row.metric}</td>
                          <td className="border-b px-3 py-2">{row.tier}</td>
                          <td className="border-b px-3 py-2">{row.sqlType}</td>
                          <td className="border-b px-3 py-2 text-right">{row.instances}</td>
                          <td className="border-b px-3 py-2 text-right">{row.bytesEach}</td>
                          <td className="border-b px-3 py-2 text-right">{row.instances * row.bytesEach}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              ) : null}
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <KPI title="Simple Model" value={formatBytes(sizing.simpleBytesPerYear)} subtext={`${formatNumber(sizing.simpleRecordsPerYear)} records/year`} icon={Activity} />
              <KPI title="Advanced Model" value={formatBytes(sizing.advancedBytesPerYear)} subtext={`${formatNumber(sizing.advancedRecordsPerYear)} records/year`} icon={Activity} />
              <KPI title="Shared Fixed Bytes" value={`${formatNumber(sizing.sharedFixedBytes)} bytes`} subtext="Metadata plus SQL row overhead" icon={Database} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          button { display: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
