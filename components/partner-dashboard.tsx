import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Package, Clock, DollarSign } from "lucide-react"

export function PartnerDashboard() {
  const stats = [
    {
      title: "This Month's Orders",
      value: "24",
      change: "+12%",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Savings",
      value: "$3,240",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pending Orders",
      value: "3",
      change: "2 shipping",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "YTD Growth",
      value: "156%",
      change: "vs last year",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-[#2D2D2D] mb-2">Welcome back, TechCorp Solutions</h1>
        <p className="text-gray-600">Manage your orders and browse our latest products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-semibold text-[#2D2D2D]">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
