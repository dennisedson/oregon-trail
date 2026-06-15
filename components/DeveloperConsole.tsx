import { Terminal } from "lucide-react";

export type DeveloperReport = {
  mode: string;
  debugNotes: string[];
  warnings: string[];
};

export function DeveloperConsole({ report }: { report: DeveloperReport }) {
  return (
    <details className="pixel-border bg-black text-trail-green">
      <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-2xl uppercase">
        <Terminal aria-hidden="true" className="h-7 w-7" />
        Developer Console
      </summary>
      <div className="space-y-4 border-t-4 border-trail-green p-4">
        <div className="grid gap-3 text-xl">
          <p>
            Mode: <span className="text-white">{report.mode}</span>
          </p>
        </div>
        {report.warnings.length > 0 ? (
          <div>
            <h2 className="text-2xl uppercase text-white">Trail Warnings</h2>
            <ul className="mt-2 list-inside list-square text-xl">
              {report.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <h2 className="text-2xl uppercase text-white">Guide Notes</h2>
          <ul className="mt-2 list-inside list-square text-xl">
            {report.debugNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
