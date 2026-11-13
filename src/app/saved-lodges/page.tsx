"use client";
import { useSavedUnits } from "@/lib/stores/useSavedUnits";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AccountPage } from "@/components/account/AccountPage";
import {
  ErrorNotice,
  Loading,
  Panel,
  Pager,
  money,
  type ApiPage,
} from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import { lodgesApi } from "@/api/lodges";
import type { BackendLodge } from "@/types/api";
import { authError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
export default function Saved() {
  return (
    <AccountPage
      title="Saved units."
      description="Your shortlist, ready when you are."
      roles={["STUDENT"]}
    >
      <SavedList />
    </AccountPage>
  );
}
function SavedList() {
  const [page, setPage] = useState(1),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const feed = useApiResource<ApiPage<BackendLodge>>(
    "/lodges/saved?page=" + page + "&pageSize=12",
  );
  async function remove(id: string) {
    setBusy(id);
    setError("");
    try {
      await lodgesApi.unsaveLodge(id);
      useSavedUnits.getState().removed(id);
      if (feed.data?.items.length === 1 && page > 1) setPage(page - 1);
      else feed.reload();
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <ErrorNotice error={error || feed.error} retry={feed.reload} />
      {!feed.data && !feed.error ? (
        <Loading />
      ) : feed.data?.items.length === 0 ? (
        <Panel>
          <p>You haven’t saved any units yet.</p>
          <Link href="/explore" className="text-brand-strong underline">
            Explore accommodation
          </Link>
        </Panel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feed.data?.items.map((lodge) => (
            <Panel key={lodge.id}>
              <Link href={"/lodges/" + lodge.id}>
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  {(lodge.primaryImage?.url || lodge.images?.[0]?.url) && (
                    <Image
                      src={lodge.primaryImage?.url || lodge.images[0].url}
                      alt={lodge.title}
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                  )}
                </div>
                <h2 className="font-semibold">{lodge.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lodge.building?.name} · {money(lodge.rent)} / year
                </p>
              </Link>
              <Button
                variant="outline"
                disabled={busy === lodge.id}
                onClick={() => remove(lodge.id)}
              >
                Remove from saved
              </Button>
            </Panel>
          ))}
        </div>
      )}
      {feed.data && (
        <Pager
          page={page}
          total={feed.data.pagination.total}
          onChange={setPage}
        />
      )}
    </>
  );
}
