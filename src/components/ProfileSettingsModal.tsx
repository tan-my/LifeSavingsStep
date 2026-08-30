"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { IncomeBasis, UserProfile } from "@/lib/types";

interface ProfileSettingsModalProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

/**
 * Everything about the projection's starting position and how income is
 * translated into spendable money: current balances, whether income amounts
 * are gross or net, and the EPF settings that drive the locked pot.
 */
export default function ProfileSettingsModal({
  profile,
  onSave,
  onClose,
}: ProfileSettingsModalProps) {
  const [savings, setSavings] = useState(String(profile.currentSavings));
  const [epfBalance, setEpfBalance] = useState(String(profile.currentEpfBalance));
  const [incomeBasis, setIncomeBasis] = useState<IncomeBasis>(profile.incomeBasis);
  const [otherDeduction, setOtherDeduction] = useState(String(profile.otherDeductionRate));
  const [epfEnabled, setEpfEnabled] = useState(profile.epf.enabled);
  const [employeeRate, setEmployeeRate] = useState(String(profile.epf.employeeRate));
  const [employerRate, setEmployerRate] = useState(String(profile.epf.employerRate));
  const [dividendRate, setDividendRate] = useState(String(profile.epf.dividendRate));
  const [accessAge, setAccessAge] = useState(String(profile.epf.accessAge));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const numbers: Record<string, number> = {};
    const fields: [string, string, string][] = [
      ["savings", savings, "Current savings"],
      ["epfBalance", epfBalance, "Current EPF balance"],
      ["otherDeduction", otherDeduction, "Other deductions"],
      ["employeeRate", employeeRate, "Employee EPF rate"],
      ["employerRate", employerRate, "Employer EPF rate"],
      ["dividendRate", dividendRate, "EPF dividend rate"],
      ["accessAge", accessAge, "EPF access age"],
    ];
    for (const [key, raw, label] of fields) {
      const n = Number(raw === "" ? 0 : raw);
      if (!Number.isFinite(n)) {
        setError(`${label} must be a number.`);
        return;
      }
      numbers[key] = n;
    }

    if (numbers.employeeRate + numbers.otherDeduction >= 100) {
      setError("Employee EPF plus other deductions must come to less than 100%.");
      return;
    }
    if (numbers.accessAge < 1 || numbers.accessAge > 100) {
      setError("EPF access age must be between 1 and 100.");
      return;
    }

    onSave({
      ...profile,
      currentSavings: numbers.savings,
      currentEpfBalance: numbers.epfBalance,
      incomeBasis,
      otherDeductionRate: numbers.otherDeduction,
      epf: {
        enabled: epfEnabled,
        employeeRate: numbers.employeeRate,
        employerRate: numbers.employerRate,
        dividendRate: numbers.dividendRate,
        accessAge: numbers.accessAge,
      },
    });
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
  const labelClass = "text-xs font-medium text-card-foreground";
  const sectionClass =
    "mt-6 text-[11px] font-medium tracking-wide text-muted-foreground uppercase";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-heading"
      >
        <h2
          id="profile-settings-heading"
          className="text-lg font-semibold text-card-foreground"
        >
          Savings &amp; income settings
        </h2>

        <h3 className={sectionClass}>Starting balances</h3>

        <label className={`mt-2 block ${labelClass}`} htmlFor="ps-savings">
          Current savings (RM)
        </label>
        <input
          id="ps-savings"
          className={inputClass}
          type="number"
          step="0.01"
          inputMode="decimal"
          value={savings}
          onChange={(e) => setSavings(e.target.value)}
          autoFocus
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Money you can actually spend — cash, deposits, liquid investments.
          Leave EPF out of this; it has its own field below.
        </p>

        <label className={`mt-4 block ${labelClass}`} htmlFor="ps-epf-balance">
          Current EPF balance (RM)
        </label>
        <input
          id="ps-epf-balance"
          className={inputClass}
          type="number"
          step="0.01"
          inputMode="decimal"
          value={epfBalance}
          onChange={(e) => setEpfBalance(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Kept separate because it can&apos;t pay next year&apos;s bills. It
          compounds on its own and is released into your spendable balance at
          the access age below.
        </p>

        <h3 className={sectionClass}>How income is entered</h3>

        <div className="mt-2 flex gap-2 rounded-lg bg-muted p-1 text-sm">
          <button
            type="button"
            onClick={() => setIncomeBasis("gross")}
            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors ${
              incomeBasis === "gross"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Gross
          </button>
          <button
            type="button"
            onClick={() => setIncomeBasis("net")}
            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors ${
              incomeBasis === "net"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Take-home
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {incomeBasis === "gross"
            ? "Amounts on your income sources are before deductions — the salary figure on your offer letter. Deductions are subtracted below."
            : "Amounts on your income sources are what actually reaches your bank. Gross is worked back out from the rates below so EPF can still be calculated."}
        </p>

        <label className={`mt-4 block ${labelClass}`} htmlFor="ps-other-deduction">
          Other deductions (% of gross)
        </label>
        <input
          id="ps-other-deduction"
          className={inputClass}
          type="number"
          step="0.1"
          inputMode="decimal"
          value={otherDeduction}
          onChange={(e) => setOtherDeduction(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Income tax, SOCSO and EIS combined. Don&apos;t include EPF — that is
          handled below, and counting it twice would understate your take-home.
        </p>

        <h3 className={sectionClass}>EPF</h3>

        <label className="mt-2 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={epfEnabled}
            onChange={(e) => setEpfEnabled(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
          />
          <span>
            <span className={labelClass}>Model EPF as a locked pot</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Off means contributions are treated as immediately spendable, and
              no pot is tracked.
            </span>
          </span>
        </label>

        {epfEnabled && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={`block ${labelClass}`} htmlFor="ps-employee-rate">
                  Employee (%)
                </label>
                <input
                  id="ps-employee-rate"
                  className={inputClass}
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={employeeRate}
                  onChange={(e) => setEmployeeRate(e.target.value)}
                />
              </div>
              <div>
                <label className={`block ${labelClass}`} htmlFor="ps-employer-rate">
                  Employer (%)
                </label>
                <input
                  id="ps-employer-rate"
                  className={inputClass}
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={employerRate}
                  onChange={(e) => setEmployerRate(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The employee share comes out of your pay; the employer share is
              paid on top, so it doesn&apos;t reduce take-home. Both land in the
              pot.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={`block ${labelClass}`} htmlFor="ps-dividend-rate">
                  Dividend (%/yr)
                </label>
                <input
                  id="ps-dividend-rate"
                  className={inputClass}
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={dividendRate}
                  onChange={(e) => setDividendRate(e.target.value)}
                />
              </div>
              <div>
                <label className={`block ${labelClass}`} htmlFor="ps-access-age">
                  Access age
                </label>
                <input
                  id="ps-access-age"
                  className={inputClass}
                  type="number"
                  step="1"
                  inputMode="numeric"
                  value={accessAge}
                  onChange={(e) => setAccessAge(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Past dividends are not a promise of future ones — this is an
              assumption, and the later decades of the projection are very
              sensitive to it.
            </p>
          </>
        )}

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg border-2 border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
