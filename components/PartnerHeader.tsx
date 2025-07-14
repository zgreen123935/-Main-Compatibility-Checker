import { NavLink, Form } from "@remix-run/react"
import type { CartApiQueryFragment } from "storefrontapi.generated"

export function PartnerHeader({
  cart,
  isLoggedIn,
  customer,
}: {
  cart: CartApiQueryFragment | null
  isLoggedIn: boolean
  customer: any
}) {
  const cartCount = cart?.totalQuantity || 0

  // Get company information from customer data
  const getCompanyInfo = (customer: any) => {
    // First try to get company from companyContacts (B2B customers)
    if (customer?.companyContacts?.nodes?.length > 0) {
      const companyContact = customer.companyContacts.nodes[0]
      return {
        name: companyContact.company.name,
        title: companyContact.title || "Partner",
        isB2B: true,
      }
    }

    // Fallback to company from address
    if (customer?.defaultAddress?.company) {
      return {
        name: customer.defaultAddress.company,
        title: "Partner",
        isB2B: true,
      }
    }

    // Individual customer
    return {
      name: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Customer",
      title: "Customer",
      isB2B: false,
    }
  }

  const companyInfo = getCompanyInfo(customer)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="text-2xl font-medium text-[#2D2D2D]">
              mysa
            </NavLink>
            {companyInfo.isB2B && (
              <div className="bg-[#BAE5D4] text-[#2D2D2D] px-3 py-1 rounded-full text-sm font-medium">
                Partner Portal
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn && customer ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[#2D2D2D]">{companyInfo.name}</p>
                  <p className="text-xs text-gray-500">{companyInfo.title}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="relative p-2 text-gray-600 hover:text-[#2D2D2D]">
                    <BellIcon />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>

                  <NavLink to="/cart" className="relative p-2 text-gray-600 hover:text-[#2D2D2D]">
                    <ShoppingCartIcon />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[#2D2D2D] text-white text-xs flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </NavLink>

                  <div className="relative group">
                    <button className="p-2 text-gray-600 hover:text-[#2D2D2D]">
                      <UserIcon />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="py-1">
                        <NavLink to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Account Settings
                        </NavLink>
                        <NavLink
                          to="/account/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Order History
                        </NavLink>
                        <Form method="post" action="/account/logout">
                          <button
                            type="submit"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <NavLink to="/account/login" className="bg-[#2D2D2D] text-white px-4 py-2 rounded-md hover:bg-gray-800">
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z M9 12l2 2 4-4" />
    </svg>
  )
}

function ShoppingCartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}
