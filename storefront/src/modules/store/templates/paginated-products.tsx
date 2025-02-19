import { getProductsListWithSort } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import { HttpTypes } from "@medusajs/types";
import ProductPreview from "@modules/products/components/product-preview";
import { Pagination } from "@modules/store/components/pagination";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { Layout, LayoutColumn } from "@/components/Layout";
import { Button, Table } from "@medusajs/ui"

const PRODUCT_LIMIT = 12;

export default async function PaginatedProducts({
  table = false,
  sortBy,
  page,
  collectionId,
  categoryId,
  typeId,
  productsIds,
  countryCode,
}: {
  table?: boolean;
  sortBy?: SortOptions;
  page: number;
  collectionId?: string | string[];
  categoryId?: string | string[];
  typeId?: string | string[];
  productsIds?: string[];
  countryCode: string;
}) {
  const queryParams: HttpTypes.StoreProductListParams = {
    limit: PRODUCT_LIMIT,
  };

  if (collectionId) queryParams["collection_id"] = Array.isArray(collectionId) ? collectionId : [collectionId];
  if (categoryId) queryParams["category_id"] = Array.isArray(categoryId) ? categoryId : [categoryId];
  if (typeId) queryParams["type_id"] = Array.isArray(typeId) ? typeId : [typeId];
  if (productsIds) queryParams["id"] = productsIds;
  if (sortBy === "created_at") queryParams["order"] = "created_at";

  const region = await getRegion(countryCode);
  if (!region) return null;

  let {
    response: { products, count },
  } = await getProductsListWithSort({ page, queryParams, sortBy, countryCode });

  const totalPages = Math.ceil(count / PRODUCT_LIMIT);
  console.log(products)
  return (
    <>
      {!table ? (
        <Layout className="gap-y-10 md:gap-y-16 mb-16 md:mb-20">
          {products.map((p) => (
            <LayoutColumn key={p.id} className="md:!col-span-4 !col-span-6">
              <ProductPreview product={p} region={region} />
            </LayoutColumn>
          ))}
        </Layout>
      ) : (
        <div className="gap-y-10 md:gap-y-16 mb-16 md:mb-20 container mx-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
                <Table.HeaderCell>Stock</Table.HeaderCell>
                <Table.HeaderCell>Weight</Table.HeaderCell>
                <Table.HeaderCell>Collection</Table.HeaderCell>
                <Table.HeaderCell>Created At</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map((p) => (
                <Table.Row key={p.id} className="hover:bg-gray-50">
                  <Table.Cell>{p.title}</Table.Cell>
                  <Table.Cell>
                    { }
                  </Table.Cell>
                  <Table.Cell>{p.variants?.[0]?.inventory_quantity ?? "N/A"}</Table.Cell>
                  <Table.Cell>{p.weight ?? "N/A"} g</Table.Cell>
                  <Table.Cell>{p.collection?.title ?? "N/A"}</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell className="space-x-2">
                    <Button>Agregar al carrito</Button>
                    <Button>Ver</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
      {totalPages > 1 && <Pagination data-testid="product-pagination" page={page} totalPages={totalPages} />}
    </>
  );
}
