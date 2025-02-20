"use server"

import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { enrichLineItems } from "@lib/util/enrich-line-items"
import {
  getCartId,
  getAuthHeaders,
  setCartId,
  removeCartId,
} from "@lib/data/cookies"
import { getRegion } from "@lib/data/regions"

export async function retrieveCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return null
  }

  const cart = await sdk.store.cart
    .retrieve(
      cartId,
      {},
      { next: { tags: ["cart"] }, ...(await getAuthHeaders()) }
    )
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })

  if (cart?.items && cart.items.length && cart.region_id) {
    cart.items = await enrichLineItems(cart.items, cart.region_id)
  }

  return cart as
    | (HttpTypes.StoreCart & {
        promotions: HttpTypes.StorePromotion[]
      })
    | null
}

export async function getCartQuantity() {
  const cart = await retrieveCart()

  if (!cart || !cart.items || !cart.items.length) {
    return 0
  }

  return cart.items.reduce((acc, item) => acc + item.quantity, 0)
}

export async function getOrSetCart(input: unknown) {
  if (typeof input !== "string") {
    throw new Error("Invalid input when retrieving cart")
  }

  const countryCode = input

  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      await getAuthHeaders()
    )
    cart = cartResp.cart as HttpTypes.StoreCart & {
      promotions: HttpTypes.StorePromotion[]
    }

    await setCartId(cart.id)
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(
      cart.id,
      { region_id: region.id },
      {},
      await getAuthHeaders()
    )
    revalidateTag("cart")
  }

  return cart
}

async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  return sdk.store.cart
    .update(cartId, data, {}, await getAuthHeaders())
    .then(({ cart }) => {
      revalidateTag("cart")
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: unknown
  quantity: unknown
  countryCode: unknown
}) {
  if (typeof variantId !== "string") {
    throw new Error("Missing variant ID when adding to cart")
  }

  if (
    typeof quantity !== "number" ||
    quantity < 1 ||
    !Number.isSafeInteger(quantity)
  ) {
    throw new Error("Missing quantity when adding to cart")
  }

  if (typeof countryCode !== "string") {
    throw new Error("Missing country code when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: unknown
  quantity: unknown
}) {
  if (typeof lineId !== "string") {
    throw new Error("Missing lineItem ID when updating line item")
  }

  if (
    typeof quantity !== "number" ||
    quantity < 1 ||
    !Number.isSafeInteger(quantity)
  ) {
    throw new Error("Missing quantity when updating line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: unknown) {
  if (typeof lineId !== "string") {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, await getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
  revalidateTag("cart")
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: unknown
  shippingMethodId: unknown
}) {
  if (typeof cartId !== "string") {
    throw new Error("Missing cart ID when setting shipping method")
  }

  if (typeof shippingMethodId !== "string") {
    throw new Error("Missing shipping method ID when setting shipping method")
  }

  return sdk.store.cart
    .addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      await getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(provider_id: unknown) {
  const cart = await retrieveCart()

  if (!cart) {
    throw new Error("Can't initiate payment without cart")
  }

  if (typeof provider_id !== "string") {
    throw new Error("Invalid payment provider")
  }

  return sdk.store.payment
    .initiatePaymentSession(
      cart,
      {
        provider_id,
      },
      {},
      await getAuthHeaders()
    )
    .then((resp) => {
      revalidateTag("cart")
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const validatedData = z.array(z.string()).safeParse(codes)

  if (validatedData.success === false) {
    throw new Error("Invalid promo codes")
  }

  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found")
  }

  await updateCart({ promo_codes: validatedData.data })
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function setEmail(
  currentState: unknown,
  { email, country_code }: { email: string; country_code: string }
) {
  try {
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }
  } catch (e: any) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not get your cart",
    }
  }

  const countryCode = z.string().min(2).safeParse(country_code)
  if (!countryCode.success) {
    return { success: false, error: "Invalid country code" }
  }

  await updateCart({ email })

  return { success: true, error: null }
}

const addressesFormSchema = z
  .object({
    shipping_address: z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      company: z.string().optional(),
      address_1: z.string().min(1),
      address_2: z.string().optional(),
      city: z.string().min(1),
      postal_code: z.string().min(1),
      province: z.string().optional(),
      country_code: z.string().min(2),
      phone: z.string().optional(),
    }),
  })
  .and(
    z.discriminatedUnion("same_as_billing", [
      z.object({
        same_as_billing: z.literal("on"),
      }),
      z.object({
        same_as_billing: z.literal("off").optional(),
        billing_address: z.object({
          first_name: z.string().min(1),
          last_name: z.string().min(1),
          company: z.string().optional(),
          address_1: z.string().min(1),
          address_2: z.string().optional(),
          city: z.string().min(1),
          postal_code: z.string().min(1),
          province: z.string().optional(),
          country_code: z.string().min(2),
          phone: z.string().optional(),
        }),
      }),
    ])
  )

export async function setAddresses(
  currentState: unknown,
  formData: z.infer<typeof addressesFormSchema>
) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    await updateCart({
      shipping_address: formData.shipping_address,
      billing_address:
        formData.same_as_billing === "on"
          ? formData.shipping_address
          : formData.billing_address,
    })
  } catch (e: any) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Could not set addresses",
    }
  }

  return { success: true, error: null }
}

export async function placeOrder() {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found when placing an order")
  }

  const cartRes = await sdk.store.cart
    .complete(cartId, {}, await getAuthHeaders())
    .then((cartRes) => {
      revalidateTag("cart")
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    await removeCartId()
    redirect(`/${countryCode}/order/confirmed/${cartRes?.order.id}`)
  }

  return cartRes.cart
}

/**
 * Updates the countryCode param and revalidate the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  if (typeof countryCode !== "string") {
    throw new Error("Invalid country code")
  }

  if (typeof currentPath !== "string") {
    throw new Error("Invalid current path")
  }

  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${countryCode}${currentPath}`)
}
