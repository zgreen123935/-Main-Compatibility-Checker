export function PartnerDashboard({ customer, orders }: { customer: any; orders: any }) {
  // Calculate stats from real order data
  const calculateStats = (orders: any) => {
    if (!orders?.nodes) {
      return {
        monthlyOrders: 0,
        totalSavings: 0,
        pendingOrders: 0,
        ytdGrowth: 0,
      }
    }

    const orderNodes = orders.nodes
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyOrders = orderNodes.filter((order: any) => {
      const orderDate = new Date(order.processedAt)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    }).length

    const totalSavings = orderNodes.reduce((total: number, order: any) => {
      // Calculate savings based on compareAtPrice vs actual price
      const orderSavings = order.lineItems.nodes.reduce((lineTotal: number, item: any) => {
        const actualPrice = Number.parseFloat(item.variant.price.amount)
        const comparePrice = item.variant.compareAtPrice
          ? Number.parseFloat(item.variant.compareAtPrice.amount)
          : actualPrice
        return lineTotal + (comparePrice - actualPrice) * item.quantity
      }, 0)
      return total + orderSavings
    }, 0)

    const pendingOrders = orderNodes.filter(
      (order: any) => order.fulfillmentStatus === "UNFULFILLED" || order.fulfillmentStatus === "PARTIALLY_FULFILLED",
    ).length

    return {
      monthlyOrders,
      totalSavings: Math.round(totalSavings),
      pendingOrders,
      ytdGrowth: 156, // This would need historical data to calculate properly
    }
  }

  const stats = calculateStats(orders)
  const companyName = customer?.defaultAddress?.company || `${customer?.firstName} ${customer?.lastName}` || "Partner"

  const dashboardStats = [
    {
      title: "This Month's Orders",
      value: stats.monthlyOrders.toString(),
      change: "+12%",
      icon: PackageIcon,
      color: "text-blue-600",
    },
    {
      title: "Total Savings",
      value: `$${stats.totalSavings.toLocaleString()}`,
      change: "+8%",
      icon: DollarSignIcon,
      color: "text-green-600",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      change: `${stats.pendingOrders > 0 ? stats.pendingOrders + " shipping" : "all shipped"}`,
      icon: ClockIcon,
      color: "text-orange-600",
    },
    {
      title: "YTD Growth",
      value: `${stats.ytdGrowth}%`,
      change: "vs last year",
      icon: TrendingUpIcon,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#2D2D2D] mb-2">Welcome back, {companyName}</h1>
        <p className="text-gray-600">Manage your orders and browse your catalog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold text-[#2D2D2D]">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Preview */}
      {orders?.nodes && orders.nodes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {orders.nodes.slice(0, 3).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-[#2D2D2D]">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{new Date(order.processedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#2D2D2D]">
                    ${order.totalPrice.amount} {order.totalPrice.currencyCode}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {order.fulfillmentStatus.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Icon components remain the same as before
function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  )
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}
