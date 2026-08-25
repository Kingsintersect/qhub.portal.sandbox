"use client"

import { useRef, useState } from "react"
import { AlertTriangle, FileUp, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useImportCourses,
  usePreviewCourseImport,
} from "@/modules/platform-operations/hooks/use-operations"
import type { CourseImportPreview } from "@/modules/platform-operations/types"

/**
 * Uploads a course catalogue into one institution's database.
 *
 * Preview first, always. This writes into someone else's records, so the
 * operator sees every parsed row and every rejection — and whether a row would
 * create or overwrite — before anything is committed. Discovering you replaced
 * a catalogue afterwards is not a recoverable kind of surprise.
 */
export function CourseImportPanel({
  institutionId,
  institutionName,
}: {
  institutionId: number
  institutionName: string
}) {
  const { can } = usePlatformPermissions()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CourseImportPreview | null>(null)

  const previewImport = usePreviewCourseImport(institutionId)
  const importCourses = useImportCourses(institutionId)

  if (!can("tenant_data.import")) {
    return null
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const onChoose = async (chosen: File | null) => {
    setFile(chosen)
    setPreview(null)

    if (!chosen) return

    const result = await previewImport.mutateAsync(chosen).catch(() => null)
    if (result) setPreview(result)
  }

  const onCommit = async () => {
    if (!file) return

    const result = await importCourses.mutateAsync(file).catch(() => null)
    if (result) reset()
  }

  const willOverwrite =
    preview?.rows.filter((r) => r.valid && r.outcome === "update").length ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          A .csv or .xlsx with columns for code, title, credit units, type and
          level. Department is optional. Levels and departments are matched by
          name against {institutionName}&rsquo;s own records, so a course cannot
          be added for a level that institution has not defined.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(event) => onChoose(event.target.files?.[0] ?? null)}
            aria-label="Course spreadsheet"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={previewImport.isPending || importCourses.isPending}
          >
            <FileUp className="mr-2 size-4" aria-hidden="true" />
            Choose file
          </Button>

          {file && (
            <span className="text-xs text-muted-foreground">{file.name}</span>
          )}

          {previewImport.isPending && (
            <span className="inline-flex items-center text-xs text-muted-foreground">
              <Loader2
                className="mr-1.5 size-3.5 animate-spin"
                aria-hidden="true"
              />
              Checking…
            </span>
          )}
        </div>

        {preview && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-medium text-foreground">
                {preview.valid} row{preview.valid === 1 ? "" : "s"} will import
              </span>
              {preview.invalid > 0 && (
                <span className="text-destructive">
                  {preview.invalid} will be skipped
                </span>
              )}
            </div>

            {willOverwrite > 0 && (
              // The consequential case. An operator adding a catalogue should
              // not silently replace one.
              <p
                role="status"
                className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {willOverwrite} existing course
                  {willOverwrite === 1 ? "" : "s"} will be overwritten — their
                  codes already exist at {institutionName}.
                </span>
              </p>
            )}

            <div className="max-h-64 overflow-auto rounded-lg border border-border">
              <table className="w-full min-w-[36rem] text-left text-xs">
                <caption className="sr-only">Parsed rows</caption>
                <thead className="sticky top-0 border-b border-border bg-muted/60">
                  <tr className="tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-3 py-2 font-medium">
                      Row
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Code
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Units
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.rows.map((row) => (
                    <tr
                      key={row.row}
                      className={cn(!row.valid && "bg-destructive/5")}
                    >
                      <td className="px-3 py-1.5 text-muted-foreground">
                        {row.row}
                      </td>
                      <td className="px-3 py-1.5 font-mono">
                        {row.code || "—"}
                      </td>
                      <td className="px-3 py-1.5">{row.title || "—"}</td>
                      <td className="px-3 py-1.5 tabular-nums">
                        {row.creditUnits}
                      </td>
                      <td className="px-3 py-1.5">
                        {row.valid ? (
                          <span className="text-muted-foreground">
                            {row.outcome}
                          </span>
                        ) : (
                          <span className="text-destructive">
                            {row.errors.join("; ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={onCommit}
                disabled={preview.valid === 0 || importCourses.isPending}
              >
                {importCourses.isPending ? (
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Upload className="mr-2 size-4" aria-hidden="true" />
                )}
                Import {preview.valid} row{preview.valid === 1 ? "" : "s"}
              </Button>
              <Button type="button" variant="outline" onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
