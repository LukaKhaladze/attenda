"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
};

export function RichTextEditor({ name, label, defaultValue = "", placeholder, required, hint }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!editorRef.current || !hiddenRef.current) {
      return;
    }

    editorRef.current.innerHTML = defaultValue || "<p></p>";
    hiddenRef.current.value = editorRef.current.innerHTML;
  }, [defaultValue]);

  function syncValue() {
    if (!editorRef.current || !hiddenRef.current) {
      return;
    }

    hiddenRef.current.value = editorRef.current.innerHTML;
  }

  function runCommand(command: "bold" | "italic" | "paragraph") {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();
    if (command === "paragraph") {
      document.execCommand("formatBlock", false, "p");
    } else {
      document.execCommand(command, false);
    }
    syncValue();
  }

  return (
    <label className="space-y-1 sm:col-span-2">
      <span className="block text-sm font-medium text-brand-800">{label}</span>
      {hint ? <span className="block text-xs text-brand-600">{hint}</span> : null}
      <div className="rounded-xl border border-brand-200 bg-white">
        <div className="flex gap-2 border-b border-brand-100 px-2 py-2">
          <button type="button" onClick={() => runCommand("bold")} className="rounded-md border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-800">
            B
          </button>
          <button type="button" onClick={() => runCommand("italic")} className="rounded-md border border-brand-200 px-2 py-1 text-xs font-semibold italic text-brand-800">
            I
          </button>
          <button type="button" onClick={() => runCommand("paragraph")} className="rounded-md border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-800">
            P
          </button>
        </div>
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          className="min-h-[120px] w-full p-3 text-sm text-brand-900 outline-none"
          data-placeholder={placeholder || ""}
        />
      </div>
      <input ref={hiddenRef} type="hidden" name={name} required={required} />
    </label>
  );
}
