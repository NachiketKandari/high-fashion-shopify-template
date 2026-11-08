"use client";

import { cn } from "cn";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const GUIDES = [
  {
    id: "tops",
    label: "Tops",
    rows: [
      { label: "Bust", values: ["32", "34", "36", "38", "40", "42", "44"] },
      { label: "High Waist", values: ["25", "27", "29", "31", "33", "35", "37"] },
      { label: "Shoulder", values: ["14", "14.5", "15", "15.5", "16", "16.5", "17"] },
    ],
    fields: [
      { key: "bust", label: "Bust" },
      { key: "waist", label: "High Waist" },
      { key: "shoulder", label: "Shoulder" },
    ],
  },
  {
    id: "dresses",
    label: "Dresses",
    rows: [
      { label: "Bust", values: ["32", "34", "36", "38", "40", "42", "44"] },
      { label: "Shoulder", values: ["14", "14.5", "15", "15.5", "16", "16.5", "17"] },
      { label: "High Waist", values: ["25", "27", "29", "31", "33", "35", "37"] },
    ],
    fields: [
      { key: "bust", label: "Bust" },
      { key: "shoulder", label: "Shoulder" },
      { key: "waist", label: "High Waist" },
    ],
  },
  {
    id: "bottoms",
    label: "Bottoms",
    rows: [
      { label: "Hip", values: ["35", "37", "39", "41", "43", "45", "47"] },
      { label: "High Waist", values: ["25", "27", "29", "31", "33", "35", "37"] },
      { label: "Mid Waist", values: ["27", "29", "31", "33", "35", "37", "39"] },
      { label: "Low Waist", values: ["29", "31", "33", "35", "37", "39", "41"] },
      {
        label: "High Waist Length",
        values: ["43.5", "44", "44.5", "45", "45.5", "46", "46.5"],
      },
      {
        label: "Mid Waist Length",
        values: ["42.5", "43", "43.5", "44", "44.5", "45", "45.5"],
      },
    ],
    fields: [
      { key: "hip", label: "Hip" },
      { key: "waist", label: "High Waist" },
      { key: "mid", label: "Mid Waist" },
    ],
  },
  {
    id: "outerwear",
    label: "Outerwear",
    rows: [
      { label: "Bust", values: ["32", "34", "36", "38", "40", "42", "44"] },
      { label: "Shoulder", values: ["14", "14.5", "15", "15.5", "16", "16.5", "17"] },
      { label: "Mid Waist", values: ["27", "29", "31", "33", "35", "37", "39"] },
    ],
    fields: [
      { key: "bust", label: "Bust" },
      { key: "shoulder", label: "Shoulder" },
      { key: "mid", label: "Mid Waist" },
    ],
  },
];

const CONVERSION = [
  ["XS", "2", "6", "34", "34", "38"],
  ["S", "4", "8", "36", "36", "40"],
  ["M", "6", "10", "38", "38", "42"],
  ["L", "8", "12", "40", "40", "44"],
  ["XL", "10", "14", "42", "42", "46"],
  ["XXL", "12", "16", "44", "44", "48"],
  ["XXXL", "14", "18", "46", "46", "50"],
];

const MEASUREMENTS = [
  {
    label: "A Bust",
    text: "Measure around the fullest part of the bust, keeping the tape parallel to the floor.",
  },
  {
    label: "B Waist",
    text: "Measure around the narrowest part of the natural waist.",
  },
  {
    label: "C Hip",
    text: "Measure around the fullest part of the hip, keeping the tape parallel to the floor.",
  },
  {
    label: "D Length from waist",
    text: "Measure from the natural waist down to the desired length of the garment.",
  },
  {
    label: "E Shoulder",
    text: "Measure from the edge of one shoulder to the edge of the other, across the back.",
  },
  {
    label: "F Sleeve length",
    text: "Measure from the shoulder edge, where the sleeve begins, down to the desired sleeve length.",
  },
];

function closestSize(values: string[], input: string) {
  const target = Number.parseFloat(input);
  if (!Number.isFinite(target)) return null;
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;
  values.forEach((value, index) => {
    const next = Math.abs(Number.parseFloat(value) - target);
    if (next < distance) {
      best = index;
      distance = next;
    }
  });
  return { distance, size: SIZES[best] };
}

export function SizeGuide({ defaultCategory }: { defaultCategory?: string } = {}) {
  const [active, setActive] = useState(defaultCategory ?? GUIDES[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [unit, setUnit] = useState<"cm" | "in">("in");
  const guide = GUIDES.find((entry) => entry.id === active) ?? GUIDES[0];

  const formatValue = (value: string) => {
    if (unit === "in") return value;
    const converted = Number.parseFloat(value) * 2.54;
    return Number.isFinite(converted) ? String(Math.round(converted * 10) / 10) : value;
  };

  return (
    <div className="grid gap-10">
      <div aria-label="Size guide categories" className="flex flex-wrap gap-6" role="group">
        {GUIDES.map((entry) => (
          <button
            aria-pressed={active === entry.id}
            className={cn(
              "type-body-sm focus-ring flex min-h-9 min-w-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-60",
              active === entry.id && "underline underline-offset-4",
            )}
            key={entry.id}
            onClick={() => {
              setActive(entry.id);
              setResult(null);
            }}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>

      <form
        className="grid gap-5 border border-rule p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const first = guide.rows[0];
          const entered = Number.parseFloat(values[first?.label ?? ""] ?? "");
          const inches = unit === "cm" ? entered / 2.54 : entered;
          const match =
            first && Number.isFinite(inches) ? closestSize(first.values, String(inches)) : null;
          setResult(match ? `${match.size} — ${guide.label}` : "Enter at least one measurement");
        }}
      >
        <h2 className="type-h2">Find my size</h2>
        <p className="type-body-sm text-ink-muted">
          Measurements in {unit === "cm" ? "centimetres" : "inches"}
        </p>
        <div className="grid gap-4 tablet:grid-cols-3">
          {guide.fields.map((field) => {
            const row = guide.rows.find((entry) => entry.label.toLowerCase().includes(field.key));
            return (
              <div className="grid gap-2" key={field.key}>
                <Label className="type-body-sm text-ink-muted" htmlFor={`size-${field.key}`}>
                  {field.label}
                </Label>
                <Input
                  id={`size-${field.key}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [row?.label ?? field.key]: event.target.value,
                    }))
                  }
                  placeholder={row?.values[2] ? formatValue(row.values[2]) : undefined}
                  value={values[row?.label ?? field.key] ?? ""}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="type-control h-9 w-fit bg-ink px-6 text-inverse hover:bg-ink/80"
            type="submit"
          >
            Find my size
          </Button>
          {result ? (
            <p aria-live="polite" className="type-body-sm">
              {result}
            </p>
          ) : null}
        </div>
      </form>

      <div className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <p className="type-label text-ink-muted">PS Sizing</p>
            <h2 className="type-display">{guide.label} — Size Guide</h2>
          </div>
          <div aria-label="Measurement unit" className="flex items-center gap-1" role="group">
            {(["cm", "in"] as const).map((option, index) => (
              <span className="flex items-center gap-1" key={option}>
                {index > 0 ? <span className="type-control text-ink-muted">/</span> : null}
                <button
                  aria-pressed={unit === option}
                  className={cn(
                    "type-control focus-ring flex min-h-9 min-w-9 items-center justify-center px-1",
                    unit === option ? "underline underline-offset-4" : "text-ink-muted",
                  )}
                  onClick={() => setUnit(option)}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        </div>
        <div
          aria-label="Size guide"
          className="overflow-x-auto border border-rule"
          role="region"
          tabIndex={0}
        >
          <table className="type-body w-full min-w-[560px] border-collapse text-center font-normal">
            <thead>
              <tr>
                <th className="type-label border-r border-b border-rule px-3 py-2 text-left">
                  <span className="sr-only">Size</span>
                </th>
                {SIZES.map((size) => (
                  <th
                    className="type-label border-r border-b border-rule px-3 py-2 last:border-r-0"
                    key={size}
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((row) => (
                <tr key={row.label}>
                  <td className="border-r border-b border-rule px-3 py-2 text-left text-ink-muted">
                    {row.label}
                  </td>
                  {row.values.map((value, index) => (
                    <td
                      className="border-r border-b border-rule px-3 py-2 last:border-r-0"
                      key={`${row.label}-${index}`}
                    >
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="type-label text-ink-muted tablet:hidden">Swipe to see all sizes</p>
      </div>

      <div className="grid gap-4">
        <h2 className="type-h2">Sizing Conversion</h2>
        <div
          aria-label="Sizing conversion"
          className="overflow-x-auto border border-rule"
          role="region"
          tabIndex={0}
        >
          <table className="type-body w-full min-w-[560px] border-collapse text-center font-normal">
            <thead>
              <tr>
                {["PS Size", "USA", "UK", "EU", "Germany", "Italy"].map((heading) => (
                  <th
                    className="type-label border-r border-b border-rule px-3 py-2 last:border-r-0"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONVERSION.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      className="border-r border-b border-rule px-3 py-2 last:border-r-0"
                      key={`${row[0]}-${index}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="type-label text-ink-muted tablet:hidden">Swipe to see all sizes</p>
      </div>

      <div className="grid gap-6 tablet:grid-cols-2">
        <div className="grid content-start gap-4">
          <h2 className="type-h2">How to measure?</h2>
          <ol className="grid gap-4" role="list">
            {MEASUREMENTS.map((item) => (
              <li className="grid gap-1" key={item.label}>
                <span className="type-body font-normal text-ink">{item.label}</span>
                <span className="type-body text-ink-muted">{item.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <Image
          alt="Body diagram showing measurement points A to F"
          className="h-auto w-full border border-rule"
          height={1200}
          sizes="100vw"
          src="/reference/clone/size-diagram.png"
          width={1200}
        />
      </div>
    </div>
  );
}
