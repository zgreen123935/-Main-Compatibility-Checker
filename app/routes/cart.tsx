import type { ActionFunctionArgs, LoaderFunctionArgs } from "@shopify/remix-oxygen"
import { json } from "@shopify/remix-oxygen"
import { Form, useActionData, useLoaderData } from "@remix-run/react"

export async function loader({ context }: LoaderFunctionArgs) {
  const { cart } = context
  return json(await cart.get())
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = context
  const formData = await request.formData()
  const { action, inputs } = CartForm.getFormInput(formData)

  if (!action) {
    throw new Error("No action provided")
  }

  let status = 200
  let result

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines)
      break
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines)
      break
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds)
      break
    default:
      throw new Error(`${action} cart action is not defined`)
  }

  const cartId = result.cart.id
  const headers = cart.setCartId(result.cart.id)

  const { cart: cartResult, errors } = result

  const redirectTo = formData.get("redirectTo") ?? null
  if (typeof redirectTo === "string") {
    status = 303
    headers.set("Location", redirectTo)
  }

  return json(
    {
      cart: cartResult,
      errors,
      analytics: {
        cartId,
      },
    },
    { status, headers },
  )
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-medium text-[#2D2D2D] mb-8">Your Cart</h1>

      {cart?.lines?.nodes?.length ? (
        <div className="space-y-4">
          {cart.lines.nodes.map((line) => (
            <div key={line.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                {line.merchandise.image && (
                  <img
                    src={line.merchandise.image.url || "/placeholder.svg"}
                    alt={line.merchandise.image.altText || ""}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-[#2D2D2D]">{line.merchandise.product.title}</h3>
                  <p className="text-gray-600">{line.merchandise.title}</p>
                  <p className="text-lg font-semibold text-[#2D2D2D]">
                    ${line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Qty: {line.quantity}</p>
                  <Form method="post">
                    <input type="hidden" name="cartId" value={cart.id} />
                    <input type="hidden" name="lineId" value={line.id} />
                    <button
                      type="submit"
                      name="action"
                      value="remove"
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center text-lg font-semibold text-[#2D2D2D]">
              <span>Total:</span>
              <span>
                ${cart.cost.totalAmount.amount} {cart.cost.totalAmount.currencyCode}
              </span>
            </div>
            <button className="w-full mt-4 bg-[#2D2D2D] hover:bg-gray-800 text-white py-3 px-6 rounded-md font-medium">
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
      )}
    </div>
  )
}

// This would typically be imported from @shopify/hydrogen
const CartForm = {
  ACTIONS: {
    LinesAdd: "LinesAdd",
    LinesUpdate: "LinesUpdate",
    LinesRemove: "LinesRemove",
  },
  getFormInput: (formData: FormData) => {
    // Simplified implementation
    return {
      action: formData.get("action"),
      inputs: {
        lines: [],
        lineIds: [],
      },
    }
  },
}
