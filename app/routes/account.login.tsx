import type { ActionFunctionArgs, LoaderFunctionArgs } from "@shopify/remix-oxygen"
import { json, redirect } from "@shopify/remix-oxygen"
import { Form, useActionData } from "@remix-run/react"

export async function loader({ context }: LoaderFunctionArgs) {
  const { customerAccount } = context

  // If already logged in, redirect to home
  if (await customerAccount.isLoggedIn()) {
    return redirect("/")
  }

  return json({})
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { customerAccount } = context
  const formData = await request.formData()

  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 })
  }

  try {
    await customerAccount.login({
      email,
      password,
    })

    return redirect("/")
  } catch (error) {
    return json({ error: "Invalid email or password" }, { status: 400 })
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h1 className="text-3xl font-medium text-[#2D2D2D]">mysa</h1>
            <div className="mt-2 bg-[#BAE5D4] text-[#2D2D2D] px-3 py-1 rounded-full text-sm font-medium inline-block">
              Partner Portal
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-medium text-[#2D2D2D]">Sign in to your partner account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Access your custom catalog and pricing</p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D2D2D]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#2D2D2D] focus:border-[#2D2D2D] focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D2D2D]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#2D2D2D] focus:border-[#2D2D2D] focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{actionData.error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#2D2D2D] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D2D2D]"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need a partner account?{" "}
              <a href="mailto:partners@getmysa.com" className="font-medium text-[#2D2D2D] hover:underline">
                Contact us
              </a>
            </p>
          </div>
        </Form>
      </div>
    </div>
  )
}
