import type { LoaderFunctionArgs } from "@shopify/remix-oxygen"
import { defer, redirect } from "@shopify/remix-oxygen"
import { useLoaderData } from "@remix-run/react"
import { PartnerDashboard } from "~/components/PartnerDashboard"
import { ProductCatalog } from "~/components/ProductCatalog"

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront, customerAccount } = context

  // Check if customer is logged in
  const isLoggedIn = await customerAccount.isLoggedIn()

  if (!isLoggedIn) {
    return redirect("/account/login")
  }

  // Get customer details
  const customerData = await customerAccount.query(CUSTOMER_QUERY)
  const customer = customerData?.data?.customer

  if (!customer) {
    return redirect("/account/login")
  }

  // Query products - Shopify will automatically filter by customer's catalogs
  // No need to specify catalogId - it's handled automatically based on customer context
  const products = await storefront.query(PRODUCTS_QUERY, {
    variables: {
      first: 20,
    },
  })

  // Get customer's recent orders for dashboard
  const orders = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: { first: 10 },
  })

  return defer({
    products,
    customer,
    orders: orders?.data?.customer?.orders,
  })
}

export default function Homepage() {
  const { products, customer, orders } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerDashboard customer={customer} orders={orders} />
      <ProductCatalog products={products} />
    </div>
  )
}

const CUSTOMER_QUERY = `#graphql
  query Customer {
    customer {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        country
        zip
      }
      companyContacts(first: 5) {
        nodes {
          id
          company {
            id
            name
            externalId
          }
          title
        }
      }
    }
  }
`

const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first) {
        nodes {
          id
          orderNumber
          processedAt
          totalPrice {
            amount
            currencyCode
          }
          fulfillmentStatus
          financialStatus
          lineItems(first: 10) {
            nodes {
              title
              quantity
              variant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`

// Simple products query - Shopify handles catalog filtering automatically
const PRODUCTS_QUERY = `#graphql
  query Products($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        description
        tags
        availableForSale
        featuredImage {
          id
          altText
          url
          width
          height
        }
        images(first: 5) {
          nodes {
            id
            altText
            url
            width
            height
          }
        }
        variants(first: 5) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`
