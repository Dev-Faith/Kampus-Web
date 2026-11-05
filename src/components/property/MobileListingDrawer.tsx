"use client";

import React from "react";
import { Drawer } from "vaul";
import { ChevronUp, Building2 } from "lucide-react";
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
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-40 flex flex-col rounded-t-[1.35rem] border-t border-border bg-card/95 text-foreground backdrop-blur-xl shadow-[var(--dialog-shadow)] outline-none max-h-[92vh]">
            {/* Grab Handle Header */}
            <div className="flex flex-col items-center justify-center p-3 border-b border-border cursor-grab active:cursor-grabbing">
              <div className="h-1.5 w-12 rounded-full bg-border hover:bg-muted-foreground transition-colors mb-2" />
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Building2 className="h-3.5 w-3.5 text-brand-strong" />
                <span>
                  {properties.length} Residences Available In This Area
                </span>
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground animate-bounce" />
              </div>
            </div>

            {/* Scrollable Feed */}
            <div className="min-h-0 overflow-y-auto px-4 py-4 space-y-4 flex-1">
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
