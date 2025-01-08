import * as React from "react"
import type { HttpTypes } from "@medusajs/types"
import { twMerge } from "tailwind-merge"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={twMerge(
                "border-border-base dark:border-border-base-dark bg-bg-subtle dark:bg-bg-subtle-dark border text-small-regular h-10 rounded-rounded p-2 flex-1",
                v === current &&
                  "border-border-interactive dark:border-border-interactive-dark",
                v !== current &&
                  "hover:shadow-elevation-card-rest dark:hover:shadow-elevation-card-rest-dark transition-shadow ease-in-out duration-150"
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
