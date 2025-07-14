import { PartnerHeader } from "@/components/partner-header"
import { PartnerDashboard } from "@/components/partner-dashboard"
import { ProductCatalog } from "@/components/product-catalog"

export default function PartnerPortalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <PartnerDashboard />
      <ProductCatalog />
    </div>
  )
}
