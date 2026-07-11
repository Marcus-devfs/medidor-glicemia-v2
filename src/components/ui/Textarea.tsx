import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";
import { formControlClass, formLabelClass } from "@/lib/formStyles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className={formLabelClass}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          formControlClass,
          "min-h-[96px] resize-none py-3",
          error && "border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
);
Textarea.displayName = "Textarea";
