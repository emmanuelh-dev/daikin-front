import { HttpTypes } from "@medusajs/types"

import { getProductsById } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { LocalizedLink } from "@/components/LocalizedLink"
import Thumbnail from "../thumbnail"
import AddToCart from "../add-to-card"
import ProductActions from "../product-actions"



export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  return (
    <LocalizedLink href={`/products/${product.handle}`}>
      <Thumbnail
        thumbnail={product.thumbnail}
        images={product.images}
        size="square"
        className="mb-4 md:mb-6"
      />
      <div className="flex justify-between max-md:flex-col">
        <div className="max-md:text-xs">
          <p className="mb-1">{product.title}</p>
          {product.collection && (
            <p className="text-grayscale-500 text-xs max-md:hidden">
              {product.collection.title}
            </p>
          )}
        </div>
        <div className="mt-4">

        <ProductActions product={product} region={region} />
        </div>
      </div>
    </LocalizedLink>
  )
}
