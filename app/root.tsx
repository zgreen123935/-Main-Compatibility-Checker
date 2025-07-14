import { Links, Meta, Outlet, Scripts, ScrollRestoration, LiveReload, useLoaderData } from "@remix-run/react"
import type { LoaderFunctionArgs } from "@shopify/remix-oxygen"
import { defer } from "@shopify/remix-oxygen"
import { Seo, useShopifyCookies } from "@shopify/hydrogen"
import favicon from "../public/favicon.ico"
import resetStyles from "./styles/reset.css"
import appStyles from "./styles/app.css"
import { Layout } from "~/components/Layout"

export const links = () => {
  return [
    { rel: "stylesheet", href: resetStyles },
    { rel: "stylesheet", href: appStyles },
    { rel: "preconnect", href: "https://cdn.shopify.com" },
    { rel: "preconnect", href: "https://shop.app" },
    { rel: "icon", type: "image/svg+xml", href: favicon },
  ]
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront, customerAccount, cart } = context

  // Check if customer is logged in
  const isLoggedIn = await customerAccount.isLoggedIn()
  let customer = null

  if (isLoggedIn) {
    try {
      // Get customer details from Customer Account API
      const customerData = await customerAccount.query(CUSTOMER_QUERY)
      customer = customerData?.data?.customer
    } catch (error) {
      console.error("Error fetching customer data:", error)
    }
  }

  return defer({
    cart: cart.get(),
    shop: await storefront.query(SHOP_QUERY),
    isLoggedIn,
    customer,
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  useShopifyCookies()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Seo />
        <Meta />
        <Links />
      </head>
      <body>
        <Layout {...data}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
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
      # Get company information for B2B customers
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

const SHOP_QUERY = `#graphql
  query Shop {
    shop {
      id
      name
      description
      primaryDomain {
        url
      }
      brand {
        logo {
          image {
            url
          }
        }
      }
    }
  }
`
