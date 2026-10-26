"use client";

import React from "react";
import { Drawer } from "vaul";
import { ChevronUp, Building2, MapPin } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/property/PropertyCard";

interface MobileListingDrawerProps {
  properties: Property[];
}

export function MobileListingDrawer({ properties }: MobileListingDrawerProps) {
  return (
    <div className="md:hidden">
      <Drawer.Root
        modal={false}
        snapPoints={[0.16, 0.55, 0.92]}
        activeSnapPoint={0.16}
      >
        <Drawer.Portal>
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-40 flex flex-col rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl outline-none max-h-[92vh]">
            {/* Grab Handle Header */}
            <div className="flex flex-col items-center justify-center p-3 border-b border-slate-100 dark:border-slate-900 cursor-grab active:cursor-grabbing">
              <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors mb-2" />
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {properties.length} Residences Available In This Area
                </span>
                <ChevronUp className="h-3.5 w-3.5 text-slate-400 animate-bounce" />
              </div>
            </div>

            {/* Scrollable Feed */}
            <div className="overflow-y-auto px-4 py-4 space-y-4 flex-1">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
