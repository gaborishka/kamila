"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  file: File | null;
}

export default function FileUpload({ onFileSelect, file }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileSelect(droppedFile);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      role="button"
      tabIndex={0}
      aria-label={file ? `Selected file: ${file.name}. Press to change.` : "Upload receipt, screenshot, or photo"}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer group transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : file
          ? "border-secondary bg-secondary/5"
          : "border-outline-variant/30 bg-surface-container-low/50 hover:bg-surface-container-low"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
      <span className="material-symbols-outlined text-primary text-xl">
        {file ? "check_circle" : "upload_file"}
      </span>
      {file ? (
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">{file.name}</p>
          <p className="text-xs text-on-surface-variant">
            {(file.size / 1024).toFixed(1)} KB — Click to change
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-bold text-on-surface">Upload receipt, screenshot, or photo</p>
          <p className="text-xs text-on-surface-variant">PNG, JPG, PDF</p>
        </div>
      )}
    </div>
  );
}
