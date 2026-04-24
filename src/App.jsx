import React, { useMemo, useState } from "react";
import greenDotLogo from "./assets/greendot-logo.png";

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
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Printer, Database, Gauge, HardDrive, Layers3, Activity, HelpCircle, X, DollarSign, Cloud } from "lucide-react";

const DAYS_PER_MONTH = 30.4375;
const DAYS_PER_YEAR = 365.25;

const PROVIDERS = [
  {
    id: "aws", name: "AWS", fullName: "Amazon RDS for SQL Server",
    color: "#FF9900", region: "us-east-1",
    pricing: {
      premium:  { rate: 0.125, label: "io1 Provisioned IOPS SSD" },
      standard: { rate: 0.115, label: "gp3 General Purpose SSD" },
      archive:  { rate: 0.004, label: "S3 Glacier Flexible Retrieval" },
    },
  },
  {
    id: "azure", name: "Azure", fullName: "Azure SQL Managed Instance",
    color: "#0078D4", region: "East US",
    pricing: {
      premium:  { rate: 0.230, label: "Business Critical tier" },
      standard: { rate: 0.115, label: "General Purpose tier" },
      archive:  { rate: 0.001, label: "Blob Storage Archive tier" },
    },
  },
  {
    id: "gcp", name: "Google Cloud", fullName: "Cloud SQL for SQL Server",
    color: "#4285F4", region: "us-central1",
    pricing: {
      premium:  { rate: 0.170, label: "SSD persistent disk" },
      standard: { rate: 0.090, label: "HDD persistent disk" },
      archive:  { rate: 0.007, label: "Coldline Storage" },
    },
  },
  {
    id: "ibm", name: "IBM Cloud", fullName: "Db2 on Cloud",
    color: "#1F70C1", region: "us-south",
    pricing: {
      premium:  { rate: 0.220, label: "Performance tier" },
      standard: { rate: 0.150, label: "Standard tier" },
      archive:  { rate: 0.007, label: "Cold Vault Object Storage" },
    },
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
        </div>
        <div className="shrink-0 rounded-2xl bg-slate-200 p-3">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-base font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">{title}</h3>
    {children}
  </div>
);

const Term = ({ label, children }) => (
  <div className="mb-3">
    <p className="text-sm font-semibold text-slate-700">{label}</p>
    <p className="text-sm text-slate-500 mt-0.5">{children}</p>
  </div>
);

function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl my-8">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-800">Calculator Guide</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">

          <Section title="What does this calculator do?">
            <p className="text-sm text-slate-500">
              This tool estimates how much SQL database storage you will need to collect and retain telemetry data from
              eyePower PDUs over time. Adjust the inputs and every output — records per hour, annual storage,
              provisioned footprint — updates instantly. Use it to compare scenarios, plan infrastructure capacity,
              and present storage requirements to technical or commercial stakeholders.
            </p>
          </Section>

          <Section title="Key concepts">
            <Term label="PDU — Power Distribution Unit">
              A managed device that monitors and controls electrical outlets in a rack or data centre. Each PDU
              continuously measures things like voltage, current, outlet states, and temperature.
            </Term>
            <Term label="Telemetry">
              The stream of measurements a PDU reports each time it is polled. A full snapshot covers up to 43
              data points — relay states, voltages, currents, temperatures, and more — totalling 181 bytes of
              payload before any database overhead is added.
            </Term>
            <Term label="Polling">
              The act of asking a device "what are your current readings?" at a regular interval. Shorter intervals
              produce more records per hour, which directly increases storage consumption.
            </Term>
            <Term label="Record">
              One row stored in the database, representing one poll response from one PDU. The total number of
              records per year is the foundation of every storage calculation.
            </Term>
          </Section>

          <Section title="Simple mode vs Advanced mode">
            <Term label="Simple mode">
              Treats every PDU as producing one standard-sized data packet at a single, averaged polling interval.
              This is the fastest way to produce a headline estimate and is ideal for early planning or
              management-facing conversations where precision is less important than speed.
            </Term>
            <Term label="Advanced mode">
              Reflects how the eyePower device actually works: different categories of data change at different
              rates and are polled at different intervals. Fast-changing operational data (relay states, alarms)
              is captured frequently; slowly-changing environmental data (temperature, humidity) is captured less
              often. This produces a more accurate storage estimate for production sizing and infrastructure
              procurement.
            </Term>
          </Section>

          <Section title="The three polling tiers (Advanced mode)">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Tier</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">What it measures</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-700">Default interval</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-700">Fast</td>
                    <td className="px-4 py-2 text-slate-500">Relay states, outlet states, fuse status, alarms, cycle timers, digital inputs</td>
                    <td className="px-4 py-2 text-right text-slate-700">10 s</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-700">Medium</td>
                    <td className="px-4 py-2 text-slate-500">Voltages, currents, frequency, power, earth leakage</td>
                    <td className="px-4 py-2 text-right text-slate-700">30 s</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-700">Slow</td>
                    <td className="px-4 py-2 text-slate-500">Temperature, humidity, internal board voltages, PSU health</td>
                    <td className="px-4 py-2 text-right text-slate-700">60 s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Preset scenarios">
            <Term label="Conservative">
              A cautious estimate using 50 PDUs and 30-second polling with minimal overhead assumptions. Use this
              when you want a floor figure or are working with a cost-sensitive audience.
            </Term>
            <Term label="Recommended">
              The balanced default: 100 PDUs, 15-second polling, 30% index overhead. A reliable starting point
              for most deployments and the figure most commonly cited in planning discussions.
            </Term>
            <Term label="Realistic Advanced">
              Uses tiered polling (Fast 10 s / Medium 30 s / Slow 60 s) with a 2-year retention window. The
              most accurate pre-production estimate once the polling strategy has been agreed.
            </Term>
            <Term label="Heavy Retention">
              Models a large estate (250 PDUs) with 3-year retention, data replication, and backup storage.
              Use this to size the upper boundary of infrastructure requirements or for worst-case procurement
              conversations.
            </Term>
          </Section>

          <Section title="Controls explained">
            <Term label="Number of PDUs">
              How many eyePower units will be monitored. Records per hour — and therefore all storage figures —
              scale directly with this number.
            </Term>
            <Term label="Simple polling interval">
              In Simple mode, how often (in seconds) each PDU is queried. At 15 seconds, one PDU produces
              240 records per hour; at 30 seconds, it produces 120.
            </Term>
            <Term label="Fast / Medium / Slow poll">
              In Advanced mode, the independent polling interval for each telemetry tier. These can be adjusted
              separately to match the actual collection schedule configured on your collector.
            </Term>
            <Term label="Metadata bytes (default: 28)">
              Every database record includes fixed identifying fields alongside the telemetry payload — device ID,
              collector ID, timestamp, status flags. These are estimated at 28 bytes per record and do not change
              regardless of which metrics are collected.
            </Term>
            <Term label="SQL row overhead (default: 24)">
              Every row in a SQL database carries a small amount of internal bookkeeping data managed by the
              database engine itself (row headers, null bitmaps, forwarding pointers). 24 bytes is a conservative
              estimate for SQL Server.
            </Term>
            <Term label="Index overhead % (default: 30%)">
              Databases build indexes to make queries fast. These indexes consume storage in addition to the
              table data — typically 20–40% of the base table size. 30% is realistic for a table with a primary
              key and two or three secondary indexes on device ID and timestamp.
            </Term>
            <Term label="Compression % (default: 0%)">
              If your database or storage tier uses compression, enter the estimated reduction here. SQL Server
              page compression on structured telemetry data typically achieves 20–40% reduction. Leave at 0%
              if compression has not been confirmed.
            </Term>
            <Term label="Parsed copy factor (default: 1.0)">
              The raw packet stores all telemetry as a compact binary or JSON payload. A parsed copy explodes
              each metric into its own queryable column, which makes reporting easier but approximately doubles
              storage. Set to 1.0 for raw storage only; 2.0 for raw plus a full parsed copy; 1.5 for raw plus
              a partial parsed view covering key metrics only.
            </Term>
            <Term label="Retention years">
              How many years of historical data will be kept in the live database. Data beyond this window is
              assumed to be archived to cheaper storage or deleted.
            </Term>
            <Term label="Growth headroom % (default: 20%)">
              A safety buffer added above the calculated retention volume. It accounts for more PDUs being
              added over time, polling intervals being shortened, or additional metrics being enabled. 20% is
              a standard infrastructure planning allowance.
            </Term>
            <Term label="Replica factor (default: 1)">
              If your database is mirrored or replicated for high availability, the total physical storage is
              multiplied by this value. Set to 2 for one primary plus one synchronous replica; 3 for two
              replicas (common in Always On Availability Groups).
            </Term>
            <Term label="Backup factor (default: 1)">
              An additional multiplier covering backup storage kept separately from the live database — for
              example, full backups retained on a NAS or object storage. Set to 1.2 if backup storage is
              approximately 20% of live volume; higher if multiple backup generations are retained.
            </Term>
          </Section>

          <Section title="Understanding the outputs">
            <Term label="Annual Storage">
              The volume of data the system will produce in one year, calculated from the effective record
              size and records per year. This is the raw data figure before retention multiplication,
              headroom, or replication are applied.
            </Term>
            <Term label="Provisioned Footprint">
              The total storage that should be physically provisioned: Annual Storage × Retention Years ×
              (1 + Headroom%) × Replica Factor × Backup Factor. This is the number to give to your
              infrastructure or cloud team when ordering capacity.
            </Term>
            <Term label="Scenario Matrix">
              A reference grid showing annual storage across different combinations of PDU count and polling
              interval using Simple mode assumptions. Use it to quickly compare options without adjusting
              the sliders one by one.
            </Term>
            <Term label="Simple vs Advanced Comparison chart">
              Shows the storage difference between Simple mode (one blended packet per poll) and Advanced
              mode (separate Fast / Medium / Slow tiers). Advanced mode is typically 15–25% larger because
              the Fast tier generates significantly more records than a blended average suggests.
            </Term>
            <Term label="Retention Growth chart">
              Projects how total retained storage grows year on year under the current settings. The
              Provisioned line includes headroom, replication, and backup multipliers on top of raw retained
              data.
            </Term>
          </Section>

        </div>
      </div>
    </div>
  );
}

function CostTab({ sizing, storageTier, setStorageTier }) {
  const provisionedGB = sizing.provisionedBytes / 1024 ** 3;

  const tiers = [
    { key: "premium",  label: "Premium SSD",    desc: "High-performance, low-latency. For active telemetry in production." },
    { key: "standard", label: "Standard SSD",   desc: "General-purpose managed database storage." },
    { key: "archive",  label: "Archive / Cold",  desc: "Object storage for historical data. Not directly queryable from SQL." },
  ];

  const costData = PROVIDERS.map((p) => {
    const { rate, label } = p.pricing[storageTier];
    const monthly = provisionedGB * rate;
    return { ...p, rate, tierLabel: label, monthly, annual: monthly * 12 };
  });

  const cheapest = costData.reduce((a, b) => (a.annual < b.annual ? a : b));
  const priciest = costData.reduce((a, b) => (a.annual > b.annual ? a : b));

  const chartData = costData.map((p) => ({
    name: p.name,
    Annual: Math.round(p.annual),
    fill: p.color,
  }));

  return (
    <div className="space-y-6">
      {/* Storage tier selector */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Storage Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tiers.map((t) => (
              <button
                key={t.key}
                onClick={() => setStorageTier(t.key)}
                className={`rounded-xl px-4 py-2 text-sm font-medium border transition-colors ${
                  storageTier === t.key
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {tiers.find((t) => t.key === storageTier)?.desc}
            {storageTier === "archive" && (
              <span className="ml-1 font-semibold text-amber-600">
                Archive pricing reflects object storage — not a live queryable SQL database.
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPI title="Provisioned Storage" value={formatBytes(sizing.provisionedBytes)} subtext="Basis for all cost estimates" icon={HardDrive} />
        <KPI title="Lowest Annual Cost" value={formatCurrency(cheapest.annual)} subtext={`${cheapest.name} — ${cheapest.tierLabel}`} icon={DollarSign} />
        <KPI title="Highest Annual Cost" value={formatCurrency(priciest.annual)} subtext={`${priciest.name} — ${priciest.tierLabel}`} icon={Cloud} />
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {costData.map((p) => (
          <Card key={p.id} className={`rounded-2xl shadow-sm overflow-hidden ${p.id === cheapest.id ? "ring-2 ring-green-500" : ""}`}>
            <div className="h-1.5" style={{ backgroundColor: p.color }} />
            <CardContent className="p-5 space-y-3">
              <div>
                <p className="text-base font-bold text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.fullName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{p.tierLabel}</p>
                <p className="text-xs text-slate-400">{p.region}</p>
              </div>
              <div className="border-t pt-3 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Monthly</span>
                  <span className="text-sm font-semibold text-slate-700">{formatCurrency(p.monthly)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Annual</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(p.annual)}</span>
                </div>
                <p className="text-xs text-slate-400">{formatNumber(provisionedGB, 1)} GB × ${p.rate.toFixed(3)}/GB/mo</p>
              </div>
              {p.id === cheapest.id && (
                <div className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700 text-center">
                  Lowest cost
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison bar chart */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Annual Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `$${formatNumber(v / 1000, 0)}k`} width={70} />
              <Tooltip formatter={(value) => [formatCurrency(value), "Annual Cost"]} />
              <Bar dataKey="Annual" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Cost Breakdown Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b px-3 py-2 text-left">Provider</th>
                <th className="border-b px-3 py-2 text-left">Service</th>
                <th className="border-b px-3 py-2 text-left">Storage tier</th>
                <th className="border-b px-3 py-2 text-right">$/GB/month</th>
                <th className="border-b px-3 py-2 text-right">Provisioned GB</th>
                <th className="border-b px-3 py-2 text-right">Monthly</th>
                <th className="border-b px-3 py-2 text-right font-semibold">Annual</th>
              </tr>
            </thead>
            <tbody>
              {costData.map((p) => (
                <tr key={p.id} className={p.id === cheapest.id ? "bg-green-50" : ""}>
                  <td className="border-b px-3 py-2 font-semibold" style={{ color: p.color }}>{p.name}</td>
                  <td className="border-b px-3 py-2 text-slate-600">{p.fullName}</td>
                  <td className="border-b px-3 py-2 text-slate-500">{p.tierLabel}</td>
                  <td className="border-b px-3 py-2 text-right">${p.rate.toFixed(3)}</td>
                  <td className="border-b px-3 py-2 text-right">{formatNumber(provisionedGB, 1)}</td>
                  <td className="border-b px-3 py-2 text-right">{formatCurrency(p.monthly)}</td>
                  <td className="border-b px-3 py-2 text-right font-semibold">{formatCurrency(p.annual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-400">Highlighted row = lowest annual cost for the selected storage tier.</p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Indicative pricing only.</span> Rates shown are public list prices for reference US regions (AWS us-east-1, Azure East US, Google us-central1, IBM us-south) as of Q1 2026. Archive / Cold tier pricing reflects object storage services — data at this tier is not directly queryable from a live SQL database and is suitable for long-term archival only. Actual costs vary by region, committed-use or reserved-instance discounts, support tier, licensing model, and negotiated enterprise agreements. Always verify current pricing against each provider's official pricing calculator before making procurement decisions.
        </p>
      </div>
    </div>
  );
}

export default function GreenDotSqlSizingCalculator() {
  const [form, setForm] = useState(presets.recommended);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [activePreset, setActivePreset] = useState("recommended");
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("sizing");
  const [storageTier, setStorageTier] = useState("standard");

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
      {/* Dark logo header */}
      <div className="bg-slate-950 print:hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center gap-5">
          <img src={greenDotLogo} alt="GreenDot by Dot Group" className="h-14 w-auto" />
          <div className="border-l border-slate-700 pl-5">
            <p className="text-white font-semibold text-base leading-tight">SQL Sizing Calculator</p>
            <p className="text-slate-400 text-xs mt-1">eyePower PDU — Storage Sizing &amp; Scenario Planner</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-slate-200 print:hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex gap-1">
          {[
            { key: "sizing", label: "Sizing Calculator" },
            { key: "costs", label: "Provider Cost Estimates" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 md:p-6 print:max-w-none print:p-6">
        {activeTab === "sizing" && (
          <div className="mb-6 print:mb-4 flex flex-wrap gap-2 print:hidden">
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
            <Button onClick={() => setShowGuide(true)} className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Guide
            </Button>
          </div>
        )}
        {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

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

          {activeTab === "sizing" ? (
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
          ) : (
            <CostTab sizing={sizing} storageTier={storageTier} setStorageTier={setStorageTier} />
          )}
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
