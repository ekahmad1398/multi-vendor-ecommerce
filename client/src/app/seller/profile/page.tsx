"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSellerProfile, updateSellerProfile } from "@/services/seller";
import { Button, ErrorState } from "@/components/ui/primitives";
import { toast } from "sonner";
import { Badge } from "@/components/ui/primitives";
import { statusTone } from "@/lib/status";

export default function SellerProfile() {
  const query = useQuery({ queryKey: ["seller-profile"], queryFn: getSellerProfile });
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: updateSellerProfile,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["seller-profile"] });
      client.invalidateQueries({ queryKey: ["backend-profile"] });
      toast.success("Seller profile updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (query.isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  return (
    <>
      <p className="eyebrow">Seller account</p>
      <h1 className="mt-2 font-serif text-5xl">Profile</h1>
      <form
        className="card mt-8 max-w-xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate(new FormData(event.currentTarget).get("name") as string);
        }}
      >
        <label className="block text-sm font-medium">
          Store owner name
          <input required name="name" defaultValue={query.data.seller.name} className="input mt-2" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Email
          <input readOnly value={query.data.seller.email} className="input mt-2 bg-stone-100" />
        </label>
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          Status <Badge tone={statusTone(query.data.seller.sellerStatus)}>{query.data.seller.sellerStatus}</Badge>
        </p>
        <Button loading={save.isPending} className="btn-dark mt-6">
          Save profile
        </Button>
      </form>
    </>
  );
}
