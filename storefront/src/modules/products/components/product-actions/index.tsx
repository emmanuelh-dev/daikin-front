"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

import { addToCart } from "@lib/data/cart"
import { getVariantItemsInStock } from "@lib/util/inventory"
import { Button } from "@/components/Button"
import { NumberField } from "@/components/NumberField"
import { useCountryCode } from "hooks/country-code"
import ProductPrice from "../product-price"
import {ShoppingCart } from "@medusajs/icons"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}


export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useCountryCode()

  const selectedVariant = product.variants?.[0] // Always select the first variant

  // check if the selected variant is in stock
  const itemsInStock = selectedVariant
    ? getVariantItemsInStock(selectedVariant)
    : 0

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    console.log("Variant")
    console.log(selectedVariant)
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })

    setIsAdding(false)
  }


  return (
    <>
      <ProductPrice product={product} variant={selectedVariant} />
      <div className="max-md:text-xs mb-8 md:mb-16 max-w-120">
      
      </div>

      <div className="flex max-sm:flex-col gap-4 mb-2">
        <NumberField
          value={quantity}
          onChange={setQuantity}
          minValue={1}
          maxValue={itemsInStock}
          className="w-full sm:w-35 max-md:justify-center max-md:gap-2"
          aria-label="Quantity"
        />
        <Button
          onPress={handleAddToCart}
          disabled={!itemsInStock || !selectedVariant || !!disabled || isAdding}
          isLoading={isAdding}
          className="px-16 py-4"
        >
          {!selectedVariant
            ? "No variants available" // More appropriate message
            : !itemsInStock
              ? "Out of stock"
              : <ShoppingCart/>}
        </Button>
      </div>
    </>
  )
}