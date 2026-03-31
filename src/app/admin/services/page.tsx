"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Search, Tag } from "lucide-react";
import { services } from "@/data/services";

const categories = ["all", "aesthetic", "surgical", "medical", "wellness"];

export default function AdminServices() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = services.filter((s) => {
    const matchCat = filter === "all" || s.category === filter;
    const matchSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the clinic&apos;s services and treatments.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === cat
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <div
            key={service.slug}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <service.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-secondary/30 text-primary capitalize">
                {service.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{service.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {service.shortDescription}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              {service.duration && (
                <span>Duration: {service.duration}</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium hover:bg-primary/20 transition-colors">
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <a
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-3 h-3" />
                View
              </a>
              <button className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {services.length} services
      </p>
    </div>
  );
}
