"use client";
import { useQueryState } from "nuqs";
import { useApiResource } from "@/lib/use-api-resource";
import { ErrorNotice, inputClass } from "@/components/account/ui";
import type { LodgeAmenity } from "@/types/api";
export function ExtraFilters() {
  const [min, setMin] = useQueryState("minPrice", { defaultValue: "" }),
    [max, setMax] = useQueryState("maxPrice", { defaultValue: "" }),
    [distance, setDistance] = useQueryState("distance", { defaultValue: "" }),
    [ids, setIds] = useQueryState("amenities", { defaultValue: "" }),
    [sort, setSort] = useQueryState("sort", { defaultValue: "featured" }),
    [, setPage] = useQueryState("page");
  const amenities = useApiResource<LodgeAmenity[]>("/amenities"),
    selected = ids.split(",").filter(Boolean);
  const update = (fn: () => void) => {
    void setPage(null);
    fn();
  };
  return (
    <details className="rounded-2xl border border-border bg-card p-4">
      <summary className="cursor-pointer font-medium">
        Price, amenities & distance
        {ids || min || max || distance ? " · Filters applied" : ""}
      </summary>
      <div className="mt-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            Minimum annual rent (₦)
            <input
              aria-label="Minimum annual rent"
              type="number"
              min={0}
              className={inputClass}
              value={min}
              onChange={(e) =>
                update(() => void setMin(e.target.value || null))
              }
            />
          </label>
          <label>
            Maximum annual rent (₦)
            <input
              aria-label="Maximum annual rent"
              type="number"
              min={0}
              className={inputClass}
              value={max}
              onChange={(e) =>
                update(() => void setMax(e.target.value || null))
              }
            />
          </label>
          <label>
            Maximum distance (km)
            <input
              aria-label="Maximum distance"
              type="number"
              min={0}
              step="0.1"
              className={inputClass}
              value={distance}
              onChange={(e) =>
                update(() => void setDistance(e.target.value || null))
              }
            />
          </label>
          <label>
            Sort results
            <select
              className={inputClass}
              value={sort}
              onChange={(e) => update(() => void setSort(e.target.value))}
            >
              <option value="featured">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Landlord rating</option>
            </select>
          </label>
        </div>
        {min && max && Number(min) > Number(max) ? (
          <p role="alert" className="text-destructive">
            Maximum rent must be at least the minimum rent.
          </p>
        ) : null}
        <ErrorNotice error={amenities.error} retry={amenities.reload} />
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Amenities</legend>
          {!amenities.data && !amenities.error && <p>Loading amenities…</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {amenities.data?.map((a) => (
              <label key={a.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.includes(a.id)}
                  onChange={(e) =>
                    update(
                      () =>
                        void setIds(
                          (e.target.checked
                            ? [...selected, a.id]
                            : selected.filter((id) => id !== a.id)
                          ).join(",") || null,
                        ),
                    )
                  }
                />
                {a.name}
              </label>
            ))}
          </div>
        </fieldset>
        {(min || max || distance || ids || sort !== "featured") && (
          <button
            type="button"
            className="text-brand-strong underline"
            onClick={() =>
              update(() => {
                void setMin(null);
                void setMax(null);
                void setDistance(null);
                void setIds(null);
                void setSort(null);
              })
            }
          >
            Clear these filters
          </button>
        )}
      </div>
    </details>
  );
}
