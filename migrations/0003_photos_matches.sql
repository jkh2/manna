alter table listings add column if not exists photo_url text;

create table if not exists pings (
  id                serial primary key,
  ask_listing_id    text not null references listings(id) on delete cascade,
  offer_listing_id  text not null references listings(id) on delete cascade,
  reason            text not null default '',
  created_at        timestamptz not null default now(),
  unique (ask_listing_id, offer_listing_id)
);

create index if not exists pings_ask_idx on pings (ask_listing_id);
create index if not exists pings_offer_idx on pings (offer_listing_id);

create table if not exists pledges (
  id          serial primary key,
  user_id     text not null unique,
  amount      integer,
  note        text not null default '',
  created_at  timestamptz not null default now()
);
