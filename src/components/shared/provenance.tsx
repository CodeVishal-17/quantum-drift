import { FlaskConical, Database, FileCode2, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SOURCE_LABEL, type SourceTag } from "@/lib/research";
import { cn } from "@/lib/utils";

/** Marks any illustrative, generated value. Always visible, never subtle. */
export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Badge variant="amber" className={cn("cursor-help", className)}>
            <FlaskConical />
            {label}
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        Illustrative placeholder. Not an IBM measurement and not an output of the trained models.
      </TooltipContent>
    </Tooltip>
  );
}

/** Marks values copied verbatim from the supplied dataset export. */
export function RecordedBadge({ className, detail }: { className?: string; detail?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Badge variant="default" className={cn("cursor-help", className)}>
            <Database className="size-3" />
            Recorded data
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="font-medium text-text">quantum_readout_error_cleaned.csv</div>
        <div className="mt-0.5">{detail ?? "Calibration observations copied from the supplied dataset export. Not a live hardware feed."}</div>
      </TooltipContent>
    </Tooltip>
  );
}

const SOURCE_ICON: Record<SourceTag, React.ComponentType<{ className?: string }>> = {
  handover: Package,
  "training-notebook": FileCode2,
  "xgb-notebook": FileCode2,
  dataset: Database,
};

/** Marks a value transcribed from the research artefacts. */
export function SourceBadge({
  source,
  className,
  detail,
}: {
  source: SourceTag;
  className?: string;
  detail?: string;
}) {
  const Icon = SOURCE_ICON[source];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Badge variant="outline" className={cn("cursor-help", className)}>
            <Icon className="size-3" />
            Research record
          </Badge>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="font-medium text-text">{SOURCE_LABEL[source]}</div>
        <div className="mt-0.5">{detail ?? "Value transcribed from the supplied research artefacts."}</div>
      </TooltipContent>
    </Tooltip>
  );
}

/** Inline legend explaining the two provenance badges. */
export function ProvenanceLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-3", className)}>
      <span className="flex items-center gap-2">
        <Badge variant="default">
          <Database className="size-3" />
          Recorded data
        </Badge>
        copied from the dataset export
      </span>
      <span className="flex items-center gap-2">
        <Badge variant="outline">
          <Package className="size-3" />
          Research record
        </Badge>
        transcribed from the notebooks and handover package
      </span>
      <span className="flex items-center gap-2">
        <Badge variant="amber">
          <FlaskConical />
          Demo data
        </Badge>
        placeholder shown only where no trained-model output exists
      </span>
    </div>
  );
}
