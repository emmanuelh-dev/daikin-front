import { HttpTypes } from "@medusajs/types"
import React, { useEffect, useMemo, useState } from "react"
import * as ReactAria from "react-aria-components"

import compareAddresses from "@lib/util/compare-addresses"
import { UpsertAddressForm } from "@modules/account/components/UpsertAddressForm"
import { Input } from "@/components/Forms"
import { UiDialogTrigger, UiDialog, UiCloseButton } from "@/components/Dialog"
import { UiModalOverlay, UiModal } from "@/components/ui/Modal"
import { UiRadio, UiRadioBox, UiRadioLabel } from "@/components/ui/Radio"
import { Icon } from "@/components/Icon"
import { Button } from "@/components/Button"
import CountrySelect from "@modules/checkout/components/country-select"
import { useCountryCode } from "hooks/country-code"

const isShippingAddressEmpty = (formData: Record<string, any>) => {
  return (
    !formData["shipping_address.first_name"] &&
    !formData["shipping_address.last_name"] &&
    !formData["shipping_address.address_1"] &&
    !formData["shipping_address.address_2"] &&
    !formData["shipping_address.company"] &&
    !formData["shipping_address.postal_code"] &&
    !formData["shipping_address.city"] &&
    !formData["shipping_address.country_code"] &&
    !formData["shipping_address.province"] &&
    !formData["shipping_address.phone"]
  )
}
// import AddressSelect from "../address-select"
import {
  UiCheckbox,
  UiCheckboxBox,
  UiCheckboxIcon,
  UiCheckboxLabel,
} from "@/components/ui/Checkbox"
import { twMerge } from "tailwind-merge"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const countryCode = useCountryCode()
  const [formData, setFormData] = useState<Record<string, any>>({})

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: Pick<
      HttpTypes.StoreCartAddress,
      | "first_name"
      | "last_name"
      | "address_1"
      | "address_2"
      | "company"
      | "postal_code"
      | "city"
      | "country_code"
      | "province"
      | "phone"
    >
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart) {
      if (cart.shipping_address) {
        setFormAddress(cart.shipping_address)
      } else if (
        // If customer has saved addresses in the region and form data is empty
        // set the first address in the region as the form data
        customer &&
        addressesInRegion &&
        addressesInRegion.length &&
        isShippingAddressEmpty(formData)
      ) {
        const defaultShippingAddress =
          addressesInRegion.find((a) => a.is_default_shipping) ||
          addressesInRegion[0]

        setFormAddress({
          first_name: defaultShippingAddress.first_name ?? undefined,
          last_name: defaultShippingAddress.last_name ?? undefined,
          address_1: defaultShippingAddress.address_1 ?? undefined,
          address_2: defaultShippingAddress.address_2 ?? undefined,
          company: defaultShippingAddress.company ?? undefined,
          postal_code: defaultShippingAddress.postal_code ?? undefined,
          city: defaultShippingAddress.city ?? undefined,
          country_code: defaultShippingAddress.country_code ?? undefined,
          province: defaultShippingAddress.province ?? undefined,
          phone: defaultShippingAddress.phone ?? undefined,
        })
      }
    }
  }, [cart, customer, addressesInRegion])

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer &&
      (addressesInRegion?.length || 0) > 0 &&
      !isShippingAddressEmpty(formData) ? (
        <div className="w-full border border-grayscale-200 rounded-xs p-4 flex flex-wrap gap-8 max-lg:flex-col mb-8">
          <div className="flex flex-1 gap-8">
            <Icon name="user" className="w-6 h-6 mt-2.5" />
            <div className="flex flex-col gap-8 flex-1">
              <div className="flex flex-wrap justify-between gap-6">
                <div className="grow basis-0">
                  <p className="text-xs text-grayscale-500 mb-1.5">Country</p>
                  <p>
                    {cart?.region?.countries?.find(
                      (c) =>
                        c.iso_2 === formData["shipping_address.country_code"]
                    )?.display_name ||
                      formData["shipping_address.country_code"]}
                  </p>
                </div>
                <div className="grow basis-0">
                  <p className="text-xs text-grayscale-500 mb-1.5">Address</p>
                  <p>{formData["shipping_address.address_1"]}</p>
                </div>
              </div>
              {formData["shipping_address.address_2"] && (
                <div>
                  <p className="text-xs text-grayscale-500 mb-1.5">
                    Apartment, suite, etc. (Optional)
                  </p>
                  <p>{formData["shipping_address.address_2"]}</p>
                </div>
              )}
              <div className="flex flex-wrap justify-between gap-6">
                <div className="grow basis-0">
                  <p className="text-xs text-grayscale-500 mb-1.5">
                    Postal Code
                  </p>
                  <p>{formData["shipping_address.postal_code"]}</p>
                </div>
                <div className="grow basis-0">
                  <p className="text-xs text-grayscale-500 mb-1.5">City</p>
                  <p>{formData["shipping_address.city"]}</p>
                </div>
              </div>
            </div>
          </div>
          <UiDialogTrigger>
            <Button variant="outline" size="sm" className="shrink-0">
              Change
            </Button>
            <UiModalOverlay>
              <UiModal>
                <UiDialog>
                  <p className="text-md mb-10">Change address</p>
                  <ReactAria.RadioGroup
                    className="flex flex-col gap-4 mb-10"
                    aria-label="Shipping methods"
                    onChange={(value) => {
                      const selectedAddress = addressesInRegion?.find(
                        (a) => a.id === value
                      )
                      if (selectedAddress) {
                        setFormAddress({
                          address_1: selectedAddress.address_1 ?? undefined,
                          address_2: selectedAddress.address_2 ?? undefined,
                          city: selectedAddress.city ?? undefined,
                          company: selectedAddress.company ?? undefined,
                          country_code:
                            selectedAddress.country_code ?? undefined,
                          first_name: selectedAddress.first_name ?? undefined,
                          last_name: selectedAddress.last_name ?? undefined,
                          phone: selectedAddress.phone ?? undefined,
                          postal_code: selectedAddress.postal_code ?? undefined,
                          province: selectedAddress.province ?? undefined,
                        })
                      }
                    }}
                    value={
                      addressesInRegion?.find((a) =>
                        compareAddresses(
                          {
                            first_name: a.first_name ?? "",
                            last_name: a.last_name ?? "",
                            address_1: a.address_1 ?? "",
                            address_2: a.address_2 ?? "",
                            company: a.company ?? "",
                            postal_code: a.postal_code ?? "",
                            city: a.city ?? "",
                            country_code: a.country_code ?? "",
                            province: a.province ?? "",
                            phone: a.phone ?? "",
                          },
                          {
                            first_name: formData["shipping_address.first_name"],
                            last_name: formData["shipping_address.last_name"],
                            address_1: formData["shipping_address.address_1"],
                            address_2: formData["shipping_address.address_2"],
                            company: formData["shipping_address.company"],
                            postal_code:
                              formData["shipping_address.postal_code"],
                            city: formData["shipping_address.city"],
                            country_code:
                              formData["shipping_address.country_code"],
                            province: formData["shipping_address.province"],
                            phone: formData["shipping_address.phone"],
                          }
                        )
                      )?.id
                    }
                  >
                    {addressesInRegion?.map((address) => (
                      <UiRadio
                        variant="outline"
                        value={address.id}
                        className="gap-4"
                        key={address.id}
                        id={address.id}
                      >
                        <UiRadioBox />
                        <UiRadioLabel>
                          {[address.first_name, address.last_name]
                            .filter(Boolean)
                            .join(" ")}
                        </UiRadioLabel>
                        <UiRadioLabel className="ml-auto text-grayscale-500 group-data-[selected=true]:font-normal">
                          {[
                            address.address_1,
                            address.address_2,
                            [address.postal_code, address.city]
                              .filter(Boolean)
                              .join(" "),
                            cart?.region?.countries?.find(
                              (c) => c.iso_2 === address.country_code
                            )?.display_name || address.country_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </UiRadioLabel>
                      </UiRadio>
                    ))}
                  </ReactAria.RadioGroup>
                  <div className="flex justify-between">
                    <UiDialogTrigger>
                      <Button>Add new address</Button>
                      <UiModalOverlay>
                        <UiModal>
                          <UiDialog>
                            <UpsertAddressForm
                              region={cart?.region}
                              defaultValues={{ country_code: countryCode }}
                            />
                          </UiDialog>
                        </UiModal>
                      </UiModalOverlay>
                    </UiDialogTrigger>
                    <UiCloseButton variant="outline">Close</UiCloseButton>
                  </div>
                </UiDialog>
              </UiModal>
            </UiModalOverlay>
          </UiDialogTrigger>
        </div>
      ) : null}
      <div
        className={twMerge(
          "grid grid-cols-2 gap-4 mb-8",
          customer &&
            (addressesInRegion?.length || 0) > 0 &&
            !isShippingAddressEmpty(formData)
            ? "hidden"
            : ""
        )}
      >
        <Input
          placeholder="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"] || ""}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          placeholder="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"] || ""}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          placeholder="Address"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"] || ""}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          placeholder="Company"
          name="shipping_address.company"
          value={formData["shipping_address.company"] || ""}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <Input
          placeholder="Postal code"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"] || ""}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <Input
          placeholder="City"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"] || ""}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          selectedKey={formData["shipping_address.country_code"] || null}
          onSelectionChange={(value) => {
            handleChange({
              target: {
                name: "shipping_address.country_code",
                value: `${value}`,
              },
            })
          }}
          isRequired
          data-testid="shipping-country-select"
        />
        {/* TODO: fix province */}
        <Input
          placeholder="State / Province"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"] || ""}
          onChange={handleChange}
          // required
          data-testid="shipping-province-input"
        />
        <Input
          placeholder="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"] || ""}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>
      {/* TODO: check this */}
      <div>
        <input
          type="hidden"
          name="same_as_billing"
          value={checked ? "on" : "off"}
        />
        <UiCheckbox
          name="same_as_billing"
          isSelected={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        >
          <UiCheckboxBox>
            <UiCheckboxIcon />
          </UiCheckboxBox>
          <UiCheckboxLabel>
            Billing address same as shipping address
          </UiCheckboxLabel>
        </UiCheckbox>
      </div>
    </>
  )
}

export default ShippingAddress
