"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

import { applyPromotions } from "@lib/data/cart"
import { Form, InputField } from "@/components/Forms"
import { twMerge } from "tailwind-merge"
import { SubmitButton } from "@modules/common/components/submit-button"
import { z } from "zod"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
  className?: string
}

export const codeFormSchema = z.object({
  code: z.string().min(1),
})

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart, className }) => {
  const { promotions = [] } = cart
  const addPromotionCode = async (values: { code: string }) => {
    if (!values.code) {
      return
    }
    const codes = promotions
      .filter((p) => p.code === undefined)
      .map((p) => p.code!)
    codes.push(values.code)

    await applyPromotions(codes)
  }

  return (
    <Form onSubmit={addPromotionCode} schema={codeFormSchema}>
      <div className={twMerge("flex gap-2 mt-10", className)}>
        <InputField
          name="code"
          inputProps={{ autoFocus: false, uiSize: "md" }}
          placeholder="Discount code"
          className="flex flex-1 flex-col"
        />
        <SubmitButton>Apply</SubmitButton>
      </div>
    </Form>
  )
}

export default DiscountCode
