"use client"

import { useState } from "react"
import { Form } from "@remix-run/react"
import type { ProductsQuery } from "storefrontapi.generated"

interface ProductCatalogProps {
  products: ProductsQuery
}

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const productNodes = products.products.nodes

  const filteredProducts = productNodes.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" ||
      product.tags.some((tag) => tag.toLowerCase().includes(selectedCategory)) ||
      product.title.toLowerCase().includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-[#2D2D2D] mb-6">Your Product Catalog</h2>
        <p className="text-gray-600 mb-6">
          Products and pricing are customized for your company. All prices shown are your contracted rates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
          >
            <option value="all">All Products</option>
            <option value="thermostat">Thermostats</option>
            <option value="sensor">Sensors</option>
            <option value="controller">Controllers</option>
            <option value="bundle">Bundles</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const variant = product.variants.nodes[0]
          const hasComparePrice =
            variant?.compareAtPrice &&
            Number.parseFloat(variant.compareAtPrice.amount) > Number.parseFloat(variant.price.amount)

          return (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.url || "/placeholder.svg"}
                      alt={product.featuredImage.altText || product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-[#2D2D2D]">{product.title}</h3>
                  {!product.availableForSale && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Out of Stock</span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                {product.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">
                          +{product.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {variant && (
                  <div className="mb-4">
                    {hasComparePrice && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 line-through">
                          MSRP: ${variant.compareAtPrice.amount} {variant.compareAtPrice.currencyCode}
                        </span>
                        <span className="bg-[#BAE5D4] text-[#2D2D2D] text-xs px-2 py-1 rounded-full font-medium">
                          Your Price
                        </span>
                      </div>
                    )}
                    <div className="text-2xl font-semibold text-[#2D2D2D]">
                      ${variant.price.amount} {variant.price.currencyCode}
                    </div>
                    {hasComparePrice && (
                      <div className="text-sm text-green-600">
                        You save: $
                        {(
                          Number.parseFloat(variant.compareAtPrice.amount) - Number.parseFloat(variant.price.amount)
                        ).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <Form method="post" action="/cart">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="variantId" value={variant?.id} />
                  <button
                    type="submit"
                    disabled={!product.availableForSale}
                    className="w-full bg-[#2D2D2D] hover:bg-gray-800 disabled:bg-gray-300 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    Add to Cart
                  </button>
                </Form>
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
      />
    </svg>
  )
}
