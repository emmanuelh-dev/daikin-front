"use client"

import * as ReactAria from "react-aria-components"
import {
  UiSelectButton,
  UiSelectDialog,
  UiSelectIcon,
} from "@/components/ui/Select"
import {
  UiCheckbox,
  UiCheckboxBox,
  UiCheckboxIcon,
  UiCheckboxLabel,
} from "@/components/ui/Checkbox"

export const TypeFilter: React.FC<{
  types: Record<string, string>
  type?: string[]
  setQueryParams: (name: string, value: string[]) => void
}> = ({ type, types, setQueryParams }) => (
  <ReactAria.DialogTrigger>
    <UiSelectButton className="w-35">
      <span>Type</span>
      <UiSelectIcon />
    </UiSelectButton>
    <ReactAria.Popover className="w-64" crossOffset={58}>
      <UiSelectDialog>
        <ReactAria.CheckboxGroup
          value={type ?? []}
          onChange={(value) => {
            setQueryParams("type", value)
          }}
        >
          {Object.entries(types).map(([key, value]) => (
            <UiCheckbox value={key} className="py-3 px-4" key={key}>
              <UiCheckboxBox>
                <UiCheckboxIcon />
              </UiCheckboxBox>
              <UiCheckboxLabel>{value}</UiCheckboxLabel>
            </UiCheckbox>
          ))}
        </ReactAria.CheckboxGroup>
      </UiSelectDialog>
    </ReactAria.Popover>
  </ReactAria.DialogTrigger>
)
