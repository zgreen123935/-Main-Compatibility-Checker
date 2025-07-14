import type React from "react"
import { Await } from "@remix-run/react"
import { Suspense } from "react"
import type { CartApiQueryFragment } from "storefrontapi.generated"
import { PartnerHeader } from "./PartnerHeader"

export function Layout({
  cart,
  children = null,
  isLoggedIn,
}: {
  cart: Promise<CartApiQueryFragment | null>
  children?: React.ReactNode
  isLoggedIn: Promise<boolean>
}) {
  return (
    <>
      <CartAside cart={cart} />
      <div className="flex flex-col min-h-screen">
        <div className="">
          <Suspense fallback={<PartnerHeader cart={null} isLoggedIn={false} />}>
            <Await resolve={Promise.all([cart, isLoggedIn])}>
              {([cart, isLoggedIn]) => <PartnerHeader cart={cart} isLoggedIn={isLoggedIn} />}
            </Await>
          </Suspense>
        </div>
        <main>{children}</main>
      </div>
    </>
  )
}

function CartAside({ cart }: { cart: Promise<CartApiQueryFragment | null> }) {
  return (
    <Suspense fallback={<p>Loading cart ...</p>}>
      <Await resolve={cart}>
        {(cart) => {
          return <CartMain cart={cart} layout="aside" />
        }}
      </Await>
    </Suspense>
  )
}

function CartMain({
  layout,
  cart,
}: {
  layout: "page" | "aside"
  cart: CartApiQueryFragment | null
}) {
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0)

  return (
    <div aria-labelledby="cart-contents">
      <div id="cart-contents" role="heading" aria-level={1}>
        {linesCount ? "Items in cart" : "Your cart is empty"}
      </div>
    </div>
  )
}
