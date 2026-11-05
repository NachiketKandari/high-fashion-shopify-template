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

export function SizeGuide() {
  const [active, setActive] = useState(GUIDES[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const guide = GUIDES.find((entry) => entry.id === active) ?? GUIDES[0];

  return (
    <div className="grid gap-10">
      <div aria-label="Size guide categories" className="flex flex-wrap gap-6" role="tablist">
        {GUIDES.map((entry) => (
          <button
            aria-selected={active === entry.id}
            className={cn(
              "cursor-pointer text-2xs uppercase tracking-wider transition-opacity hover:opacity-60",
              active === entry.id && "underline underline-offset-4",
            )}
            key={entry.id}
            onClick={() => {
              setActive(entry.id);
              setResult(null);
            }}
            role="tab"
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
          const match = first ? closestSize(first.values, values[first.label] ?? "") : null;
          setResult(match ? `${match.size} — ${guide.label}` : "Enter at least one measurement");
        }}
      >
        <p className="text-2xs uppercase tracking-wider">Find my size (inches)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {guide.fields.map((field) => {
            const row = guide.rows.find((entry) => entry.label.toLowerCase().includes(field.key));
            return (
              <div className="grid gap-2" key={field.key}>
                <Label className="text-2xs uppercase tracking-wider" htmlFor={`size-${field.key}`}>
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
                  placeholder={row?.values[2]}
                  value={values[row?.label ?? field.key] ?? ""}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="h-9 w-fit rounded-none bg-foreground px-6 text-2xs uppercase tracking-wider text-background hover:bg-foreground/90"
            type="submit"
          >
            Find my size
          </Button>
          {result ? (
            <p aria-live="polite" className="text-2xs uppercase tracking-wider">
              {result}
            </p>
          ) : null}
        </div>
      </form>

      <div className="grid gap-4">
        <h2 className="text-2xs uppercase tracking-wider">{guide.label} — Size Guide</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-2xs">
            <thead>
              <tr>
                <th className="border-b border-rule py-2 pr-4 font-normal uppercase tracking-wider" />
                {SIZES.map((size) => (
                  <th
                    className="border-b border-rule py-2 pr-4 font-normal uppercase tracking-wider"
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
                  <td className="border-b border-rule py-2 pr-4 text-muted-foreground">
                    {row.label}
                  </td>
                  {row.values.map((value, index) => (
                    <td className="border-b border-rule py-2 pr-4" key={`${row.label}-${index}`}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4">
        <h2 className="text-2xs uppercase tracking-wider">Sizing Conversion</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-2xs">
            <thead>
              <tr>
                {["PS Size", "USA", "UK", "EU", "Germany", "Italy"].map((heading) => (
                  <th
                    className="border-b border-rule py-2 pr-4 font-normal uppercase tracking-wider"
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
                    <td className="border-b border-rule py-2 pr-4" key={`${row[0]}-${index}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <h2 className="text-2xs uppercase tracking-wider">How to measure?</h2>
          <ol className="grid gap-4" role="list">
            {MEASUREMENTS.map((item) => (
              <li className="grid gap-1" key={item.label}>
                <span className="text-2xs uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-light leading-[21px] tracking-wide text-muted-foreground">
                  {item.text}
                </span>
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
