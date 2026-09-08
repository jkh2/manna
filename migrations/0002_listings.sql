-- Manna listings: gifts, lends, offers, and asks. user_id is TEXT (Better Auth).
create table if not exists listings (
  id              text primary key,
  user_id         text not null,
  kind            text not null,
  category        text not null,
  title           text not null,
  description     text not null,
  city            text not null,
  region          text not null,
  lat             double precision not null,
  lng             double precision not null,
  fulfillment     text not null,
  national_ok     boolean not null default false,
  condition       text,
  status          text not null default 'open',
  giver_name      text not null,
  estimated_lbs   integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists listings_status_idx on listings (status);
create index if not exists listings_kind_idx on listings (kind);
create index if not exists listings_user_id_idx on listings (user_id);
create index if not exists listings_geo_idx on listings (lat, lng);

create table if not exists interests (
  id          serial primary key,
  listing_id  text not null references listings(id) on delete cascade,
  user_id     text not null,
  note        text not null default '',
  created_at  timestamptz not null default now(),
  unique (listing_id, user_id)
);

create index if not exists interests_listing_idx on interests (listing_id);
create index if not exists interests_user_idx on interests (user_id);
