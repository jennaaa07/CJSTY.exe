
import { useEffect, useState } from "react";

type LabourRecord = {
  date: string;
  u_rate: number;
  p_rate: number;
  ep_ratio: number;
  lf_employed: number;
  lf_unemployed: number;
};

const API_URL =
  "https://api.data.gov.my/data-catalogue?id=lfs_month&sort=-date&limit=6&include=date,u_rate,p_rate,ep_ratio,lf_employed,lf_unemployed";

const SOURCE_URL = "https://open.dosm.gov.my/data-catalogue/lfs_month";

function formatMonth(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-MY", {
    month: "short",
    year: "numeric",
  });
}

function formatThousands(value: number) {
  return `${(value / 1000).toFixed(2)} million`;
}

export default function LabourMarketTrends() {
  const [records, setRecords] = useState<LabourRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API request failed (${response.status})`);
        }

        const data: LabourRecord[] = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("The API returned no records.");
        }

        setRecords(data);
        setLastFetched(new Date().toLocaleString());
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, []);

  const latest = records[0];

  return (
    <section className="space-y-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            BLOOMPATH · LIVE DATA
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Malaysia Labour Market
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Official employment indicators from DOSM via OpenDOSM.
          </p>
        </div>

        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-emerald-700 underline"
        >
          View official source ↗
        </a>
      </div>

      {loading && (
        <p className="text-sm text-slate-600">
          Loading the latest official data…
        </p>
      )}

      {error && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Could not load live data.</p>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg border border-amber-300 px-3 py-2"
          >
            Reload page
          </button>
        </div>
      )}

      {!loading && !error && latest && (
        <>
          <p className="text-sm text-slate-500">
            Latest observation: {formatMonth(latest.date)}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-slate-600">Unemployment rate</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">
                {Number(latest.u_rate).toFixed(1)}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Participation rate</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {Number(latest.p_rate).toFixed(1)}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Employed persons</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatThousands(Number(latest.lf_employed))}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4">Observation month</th>
                  <th className="py-3 pr-4">Unemployment</th>
                  <th className="py-3 pr-4">Participation</th>
                  <th className="py-3 pr-4">Employed</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.date}
                    className="border-b border-slate-100"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {formatMonth(record.date)}
                    </td>
                    <td className="py-3 pr-4">
                      {Number(record.u_rate).toFixed(1)}%
                    </td>
                    <td className="py-3 pr-4">
                      {Number(record.p_rate).toFixed(1)}%
                    </td>
                    <td className="py-3 pr-4">
                      {formatThousands(Number(record.lf_employed))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p>
              Source: Department of Statistics Malaysia (DOSM), OpenDOSM.
            </p>
            <p>Retrieved from API: {lastFetched}</p>
            <p>
              Retrieved time is not the publication date. Values describe
              the reported month, not a forecast of future jobs.
            </p>
            <p>
              Units: employed persons are shown in millions; rates are
              percentages.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
