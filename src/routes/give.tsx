import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PlacePicker } from "@/components/place-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { compressImage } from "@/lib/compress-image";
import { createListing } from "@/lib/listings";
import { usePlaceStore } from "@/lib/place-store";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  KINDS,
  KIND_HINT,
  KIND_LABEL,
  type Category,
  type Fulfillment,
  type Kind,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/give")({
  component: GivePage,
  validateSearch: (search: Record<string, unknown>): { kind?: Kind } => {
    const kind = search.kind;
    if (typeof kind === "string" && (KINDS as readonly string[]).includes(kind)) {
      return { kind: kind as Kind };
    }
    return {};
  },
});

type Handoff = "local" | "ship" | "remote";
type LocalHow = "porch" | "public" | "pickup";
type Postage = "prepaid" | "receiver";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 min-h-11 rounded-full px-4 text-sm",
        active ? "bg-ink text-paper" : "bg-sunken text-muted",
      )}
    >
      {children}
    </button>
  );
}

function GivePage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const { place } = usePlaceStore();
  const { kind: presetKind } = Route.useSearch();

  const [kind, setKind] = useState<Kind>(presetKind ?? "give");
  const [category, setCategory] = useState<Category>("goods");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [handoff, setHandoff] = useState<Handoff>("local");
  const [localHow, setLocalHow] = useState<LocalHow>("porch");
  const [postage, setPostage] = useState<Postage>("receiver");
  const [pickupPlace, setPickupPlace] = useState("");
  const [condition, setCondition] = useState("");
  const [lbs, setLbs] = useState("0");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const fulfillment: Fulfillment =
    handoff === "local" ? localHow : handoff === "remote" ? "remote" : postage === "prepaid" ? "ship_prepaid" : "ship";

  const mutation = useMutation({
    mutationFn: () =>
      createListing({
        data: {
          kind,
          category,
          title: title.trim(),
          description: description.trim(),
          city: place.city,
          region: place.region,
          lat: place.lat,
          lng: place.lng,
          fulfillment,
          condition: condition.trim() || null,
          giverName: user?.displayName || "Neighbor",
          estimatedLbs: Math.max(0, Number.parseInt(lbs, 10) || 0),
          photoUrl,
          pickupPlace: handoff === "local" ? pickupPlace.trim() || null : null,
        },
      }),
    onSuccess: (result) => {
      if (result.matches.length > 0) {
        const first = result.matches[0];
        toast.success(
          `On the porch — and it may answer “${first.askTitle}”.`,
        );
      } else {
        toast.success("It is on the porch.");
      }
      void navigate({ to: "/listing/$id", params: { id: result.id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isPending) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <div className="h-80 animate-pulse rounded-xl bg-sunken/80" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">
        Give or ask
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        {kind === "ask"
          ? "What do you need?"
          : kind === "lend"
            ? "What can they borrow?"
            : kind === "offer"
              ? "What can you do?"
              : "What is extra?"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The item is free. You choose how they receive it — local pickup, or
        shipping with who covers postage.
      </p>

      <div className="mt-6 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <PlacePicker compact showRadius={false} />
      </div>

      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (handoff === "local" && pickupPlace.trim().length < 3) {
            toast.error("Say where they should pick it up.");
            return;
          }
          mutation.mutate();
        }}
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium">This is</legend>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((item) => (
              <Chip key={item} active={kind === item} onClick={() => setKind(item)}>
                {KIND_LABEL[item]}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{KIND_HINT[kind]}</p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">What</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <Chip key={item} active={category === item} onClick={() => setCategory(item)}>
                {CATEGORY_LABEL[item]}
              </Chip>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Title</span>
          <Input
            required
            minLength={3}
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Oak dresser, extra zucchini, a ride Saturday…"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">The particulars</span>
          <Textarea
            required
            minLength={10}
            maxLength={1200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Condition, when to come, anything a neighbor should know."
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">A photograph (optional)</span>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-sunken file:px-4 file:text-sm file:text-ink"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setPhotoBusy(true);
              try {
                setPhotoUrl(await compressImage(file));
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not use that photo.");
              } finally {
                setPhotoBusy(false);
              }
            }}
          />
          {photoUrl && (
            <img
              src={photoUrl}
              alt=""
              className="mt-2 aspect-[4/3] w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-ink/10"
            />
          )}
        </label>

        <fieldset className="space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <legend className="text-sm font-medium">How they receive it</legend>
          <div className="flex flex-wrap gap-2">
            <Chip active={handoff === "local"} onClick={() => setHandoff("local")}>
              Local pickup
            </Chip>
            <Chip active={handoff === "ship"} onClick={() => setHandoff("ship")}>
              I will ship
            </Chip>
            <Chip active={handoff === "remote"} onClick={() => setHandoff("remote")}>
              Remote
            </Chip>
          </div>

          {handoff === "local" && (
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">
                  {kind === "ask" ? "Where you can pick it up" : "Pickup location"}
                </span>
                <Input
                  required
                  minLength={3}
                  maxLength={120}
                  value={pickupPlace}
                  onChange={(event) => setPickupPlace(event.target.value)}
                  placeholder={
                    kind === "ask"
                      ? "I can pick up in Alamosa, or the valley…"
                      : "Porch on State Ave, cooler on the step…"
                  }
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-medium">Where they meet you</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={localHow === "porch"} onClick={() => setLocalHow("porch")}>
                    Porch
                  </Chip>
                  <Chip active={localHow === "public"} onClick={() => setLocalHow("public")}>
                    Public place
                  </Chip>
                  <Chip active={localHow === "pickup"} onClick={() => setLocalHow("pickup")}>
                    We’ll arrange
                  </Chip>
                </div>
              </div>
            </div>
          )}

          {handoff === "ship" && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Who covers postage?</p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPostage("prepaid")}
                  className={cn(
                    "rounded-lg px-4 py-3 text-left text-sm",
                    postage === "prepaid" ? "bg-ink text-paper" : "bg-sunken text-muted",
                  )}
                >
                  <span className="block font-medium">I cover postage</span>
                  <span className="mt-0.5 block text-xs opacity-80">
                    Browsers will see: Shipping is free
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostage("receiver")}
                  className={cn(
                    "rounded-lg px-4 py-3 text-left text-sm",
                    postage === "receiver" ? "bg-ink text-paper" : "bg-sunken text-muted",
                  )}
                >
                  <span className="block font-medium">They cover postage</span>
                  <span className="mt-0.5 block text-xs opacity-80">
                    Browsers will see: You cover postage
                  </span>
                </button>
              </div>
              <p className="text-xs text-muted">
                Shipped gifts can appear when someone searches the whole United States.
                The item itself stays free — only the post office gets paid, if anyone does.
              </p>
            </div>
          )}

          {handoff === "remote" && (
            <p className="text-xs text-muted">
              No travel. Help, files, or a video call. This can appear nationwide.
            </p>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Condition</span>
            <Input
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              placeholder="Good, fair, works…"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Rough pounds (optional)</span>
            <Input
              inputMode="numeric"
              value={lbs}
              onChange={(event) => setLbs(event.target.value)}
            />
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending || photoBusy}>
          {mutation.isPending ? "Posting…" : kind === "ask" ? "Post this need" : "Put it on the porch"}
        </Button>
      </form>
    </main>
  );
}
