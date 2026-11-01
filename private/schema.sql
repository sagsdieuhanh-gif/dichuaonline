-- CHANH DIEN NOI BO -- dedicated Supabase project ONLY (never SAGS).
-- Disable public/anonymous Auth signups. Invite employees from Auth dashboard.
create table if not exists public.temple_members(
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 1 and 60),
 avatar text not null default 'man' check(avatar in ('man','woman')),
 role text not null default 'member' check(role in ('member','abbot')),
 active boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.temple_wallets(
 user_id uuid primary key references public.temple_members(user_id) on delete cascade,
 balance bigint not null default 0 check(balance between 0 and 1000000000)
);
create table if not exists public.temple_coin_ledger(
 id bigint generated always as identity primary key,
 user_id uuid not null references public.temple_members(user_id),
 actor_id uuid not null references public.temple_members(user_id),
 kind text not null check(kind in ('grant','spend')),
 delta bigint not null check(delta<>0),
 balance_after bigint not null check(balance_after>=0),
 ritual_code text,
 note text not null default '', request_id uuid not null unique,
 created_at timestamptz not null default now()
);
create table if not exists public.temple_rituals(
 code text primary key, label text not null,
 coin_cost int check(coin_cost between 0 and 100000), enabled boolean not null default false,
 constraint price_when_enabled check(not enabled or coin_cost is not null)
);
insert into public.temple_rituals(code,label) values('incense','Dâng hương'),('flower','Dâng hoa'),('bell','Thỉnh chuông'),('lotus','Dâng sen') on conflict do nothing;
create table if not exists public.temple_room_guard(
 id int primary key check(id=1),capacity int not null default 100 check(capacity between 1 and 100)
);
insert into public.temple_room_guard(id,capacity) values(1,100) on conflict do nothing;
create table if not exists public.temple_room_presence(
 user_id uuid primary key references public.temple_members(user_id) on delete cascade,
 seat_no smallint not null unique check(seat_no between 1 and 100),
 joined_at timestamptz not null default now(),lease_until timestamptz not null
);
create table if not exists public.temple_tiktok_requests(
 tiktok_id text primary key check(length(tiktok_id) between 1 and 96),
 display_name text not null check(length(display_name) between 1 and 60),
 avatar_url text not null default '',last_comment text not null default '',
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 seat_no smallint unique check(seat_no between 1 and 100),
 requested_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 constraint tiktok_seat_status check((status='approved')=(seat_no is not null))
);
create index if not exists temple_presence_expiry on public.temple_room_presence(lease_until);

-- Create an unapproved member record for each invited Auth account.
create schema if not exists temple_internal;
create or replace function temple_internal.new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.temple_members(user_id,display_name) values(new.id,left(coalesce(nullif(split_part(new.email,'@',1),''),'Thành viên'),60)) on conflict do nothing;
 insert into public.temple_wallets(user_id) values(new.id) on conflict do nothing;
 return new;
end;$$;
drop trigger if exists temple_new_auth_user on auth.users;
create trigger temple_new_auth_user after insert on auth.users for each row execute function temple_internal.new_user();

create or replace function public.temple_is_abbot() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.temple_members where user_id=(select auth.uid()) and role='abbot' and active);
$$;
create or replace function public.temple_is_active() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.temple_members where user_id=(select auth.uid()) and active);
$$;
revoke all on function public.temple_is_active(),public.temple_is_abbot() from public,anon;
grant execute on function public.temple_is_active(),public.temple_is_abbot() to authenticated;

alter table public.temple_members enable row level security;
alter table public.temple_wallets enable row level security;
alter table public.temple_coin_ledger enable row level security;
alter table public.temple_rituals enable row level security;
alter table public.temple_room_guard enable row level security;
alter table public.temple_room_presence enable row level security;
alter table public.temple_tiktok_requests enable row level security;
revoke all on public.temple_members,public.temple_wallets,public.temple_coin_ledger,public.temple_rituals,public.temple_room_guard,public.temple_room_presence,public.temple_tiktok_requests from anon,authenticated;
grant select on public.temple_members,public.temple_wallets,public.temple_coin_ledger,public.temple_rituals,public.temple_room_guard,public.temple_room_presence,public.temple_tiktok_requests to authenticated;

drop policy if exists temple_members_read on public.temple_members;
create policy temple_members_read on public.temple_members for select to authenticated using(user_id=(select auth.uid()) or (active and (select public.temple_is_active())) or (select public.temple_is_abbot()));
drop policy if exists temple_wallet_read on public.temple_wallets;
create policy temple_wallet_read on public.temple_wallets for select to authenticated using(user_id=(select auth.uid()) or (select public.temple_is_abbot()));
drop policy if exists temple_ledger_read on public.temple_coin_ledger;
create policy temple_ledger_read on public.temple_coin_ledger for select to authenticated using(user_id=(select auth.uid()) or (select public.temple_is_abbot()));
drop policy if exists temple_ritual_read on public.temple_rituals;
create policy temple_ritual_read on public.temple_rituals for select to authenticated using((enabled and (select public.temple_is_active())) or (select public.temple_is_abbot()));
drop policy if exists temple_presence_read on public.temple_room_presence;
create policy temple_presence_read on public.temple_room_presence for select to authenticated using((select public.temple_is_active()));
drop policy if exists temple_guard_read on public.temple_room_guard;
create policy temple_guard_read on public.temple_room_guard for select to authenticated using((select public.temple_is_active()));
drop policy if exists temple_tiktok_read on public.temple_tiktok_requests;
create policy temple_tiktok_read on public.temple_tiktok_requests for select to authenticated using((select public.temple_is_abbot()) or (status='approved' and (select public.temple_is_active())));

-- Only RPCs can modify coins and seating. Locked guard serializes ALL seat admissions.
create or replace function public.temple_join() returns integer language plpgsql security definer set search_path='' as $$
declare cap int; seat_number int; old_seat int;
begin
 if not public.temple_is_active() then raise exception 'Chờ Trụ trì duyệt tài khoản';end if;
 select capacity into cap from public.temple_room_guard where id=1 for update;
 delete from public.temple_room_presence where lease_until<clock_timestamp();
 select seat_no into old_seat from public.temple_room_presence where user_id=(select auth.uid());
 if found then update public.temple_room_presence set lease_until=clock_timestamp()+interval '70 seconds' where user_id=(select auth.uid()); return old_seat;end if;
 if (select count(*) from public.temple_room_presence)+(select count(*) from public.temple_tiktok_requests where status='approved')>=cap then raise exception 'Chánh điện đủ 100 người';end if;
 select n into seat_number from generate_series(1,cap) n where not exists(select 1 from public.temple_room_presence p where p.seat_no=n) and not exists(select 1 from public.temple_tiktok_requests t where t.status='approved' and t.seat_no=n) order by n limit 1;
 if seat_number is null then raise exception 'Không còn chỗ';end if;
 insert into public.temple_room_presence(user_id,seat_no,lease_until) values(auth.uid(),seat_number,clock_timestamp()+interval '70 seconds');
 return seat_number;
end;$$;
create or replace function public.temple_renew() returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not public.temple_is_active() then return false;end if;
 update public.temple_room_presence set lease_until=clock_timestamp()+interval '70 seconds' where user_id=(select auth.uid()) and lease_until>clock_timestamp();
 return found;
end;$$;
create or replace function public.temple_leave() returns void language plpgsql security definer set search_path='' as $$
begin delete from public.temple_room_presence where user_id=(select auth.uid());end;$$;

create or replace function public.temple_admin_member(p_user uuid,p_name text,p_avatar text,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.temple_is_abbot() then raise exception 'Chỉ Trụ trì có quyền duyệt thành viên';end if;
 if length(btrim(coalesce(p_name,''))) not between 1 and 60 or p_avatar not in ('man','woman') then raise exception 'Thông tin không hợp lệ';end if;
 if p_user=(select auth.uid()) and not p_active then raise exception 'Không thể tự khóa Trụ trì';end if;
 update public.temple_members set display_name=btrim(p_name),avatar=p_avatar,active=p_active where user_id=p_user;
 if not found then raise exception 'Tài khoản chưa được mời';end if;
 if not p_active then delete from public.temple_room_presence where user_id=p_user;end if;
end;$$;

create or replace function public.temple_admin_tiktok_decide(p_tiktok_id text,p_allow boolean) returns text language plpgsql security definer set search_path='' as $$
declare cap int; chosen int; was text;
begin
 if not public.temple_is_abbot() then raise exception 'Chỉ Trụ trì được duyệt TikTok';end if;
 select capacity into cap from public.temple_room_guard where id=1 for update;
 select status into was from public.temple_tiktok_requests where tiktok_id=p_tiktok_id for update;
 if not found then raise exception 'Không có yêu cầu TikTok';end if;
 if not p_allow then update public.temple_tiktok_requests set status='rejected',seat_no=null,updated_at=now() where tiktok_id=p_tiktok_id;return 'rejected';end if;
 if was='approved' then return 'approved';end if;
 delete from public.temple_room_presence where lease_until<clock_timestamp();
 if (select count(*) from public.temple_room_presence)+(select count(*) from public.temple_tiktok_requests where status='approved')>=cap then raise exception 'Chánh điện đủ 100 người';end if;
 select n into chosen from generate_series(1,cap) n where not exists(select 1 from public.temple_room_presence p where p.seat_no=n) and not exists(select 1 from public.temple_tiktok_requests t where t.status='approved' and t.seat_no=n) order by n limit 1;
 update public.temple_tiktok_requests set status='approved',seat_no=chosen,updated_at=now() where tiktok_id=p_tiktok_id;
 return 'approved';
end;$$;

create or replace function public.temple_admin_grant(p_user uuid,p_coins integer,p_note text,p_request uuid) returns bigint language plpgsql security definer set search_path='' as $$
declare balance_now bigint; previous public.temple_coin_ledger%rowtype;
begin
 if not public.temple_is_abbot() then raise exception 'Chỉ Trụ trì được cộng coin';end if;
 if p_user is null or p_request is null or p_coins not between 1 and 100000 then raise exception 'Số coin không hợp lệ';end if;
 select * into previous from public.temple_coin_ledger where request_id=p_request;
 if found then if previous.kind<>'grant' or previous.user_id<>p_user or previous.delta<>p_coins then raise exception 'Trùng mã giao dịch';end if;return previous.balance_after;end if;
 if not exists(select 1 from public.temple_members where user_id=p_user and active) then raise exception 'Tài khoản chưa được duyệt';end if;
 select balance into balance_now from public.temple_wallets where user_id=p_user for update;
 if not found or balance_now+p_coins>1000000000 then raise exception 'Ví coin không hợp lệ';end if;
 update public.temple_wallets set balance=balance_now+p_coins where user_id=p_user;
 insert into public.temple_coin_ledger(user_id,actor_id,kind,delta,balance_after,note,request_id)
 values(p_user,auth.uid(),'grant',p_coins,balance_now+p_coins,left(coalesce(p_note,''),200),p_request);
 return balance_now+p_coins;
end;$$;

create or replace function public.temple_spend(p_code text,p_request uuid) returns bigint language plpgsql security definer set search_path='' as $$
declare price int;balance_now bigint;previous public.temple_coin_ledger%rowtype;
begin
 if not public.temple_is_active() then raise exception 'Tài khoản chưa được duyệt';end if;
 if p_request is null then raise exception 'Thiếu mã giao dịch';end if;
 select * into previous from public.temple_coin_ledger where request_id=p_request;
 if found then if previous.kind<>'spend' or previous.user_id<>(select auth.uid()) or previous.ritual_code is distinct from p_code then raise exception 'Trùng mã giao dịch';end if;return previous.balance_after;end if;
 select coin_cost into price from public.temple_rituals where code=p_code and enabled for share;
 if not found or price is null then raise exception 'Nghi lễ chưa mở';end if;
 select balance into balance_now from public.temple_wallets where user_id=(select auth.uid()) for update;
 if not found or balance_now<price then raise exception 'Không đủ coin, liên hệ Trụ trì';end if;
 update public.temple_wallets set balance=balance_now-price where user_id=(select auth.uid());
 if price>0 then insert into public.temple_coin_ledger(user_id,actor_id,kind,delta,balance_after,ritual_code,request_id) values(auth.uid(),auth.uid(),'spend',-price,balance_now-price,p_code,p_request);end if;
 return balance_now-price;
end;$$;

create or replace function public.temple_admin_ritual(p_code text,p_price integer,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.temple_is_abbot() then raise exception 'Chỉ Trụ trì được đặt giá';end if;
 if p_price is not null and (p_price<0 or p_price>100000) then raise exception 'Giá coin không hợp lệ';end if;
 if p_enabled and p_price is null then raise exception 'Cần chọn giá coin';end if;
 update public.temple_rituals set coin_cost=p_price,enabled=p_enabled where code=p_code;
 if not found then raise exception 'Nghi lễ không tồn tại';end if;
end;$$;

revoke all on function temple_internal.new_user() from public,anon,authenticated;
revoke all on function public.temple_join(),public.temple_renew(),public.temple_leave(),public.temple_admin_member(uuid,text,text,boolean),public.temple_admin_tiktok_decide(text,boolean),public.temple_admin_grant(uuid,integer,text,uuid),public.temple_spend(text,uuid),public.temple_admin_ritual(text,integer,boolean) from public,anon;
grant execute on function public.temple_join(),public.temple_renew(),public.temple_leave(),public.temple_admin_member(uuid,text,text,boolean),public.temple_admin_tiktok_decide(text,boolean),public.temple_admin_grant(uuid,integer,text,uuid),public.temple_spend(text,uuid),public.temple_admin_ritual(text,integer,boolean) to authenticated;

alter publication supabase_realtime add table public.temple_room_presence;
alter publication supabase_realtime add table public.temple_wallets;
alter publication supabase_realtime add table public.temple_tiktok_requests;

-- First create/invite your own account. Then, in SQL Editor, run with your actual UUID:
-- UPDATE public.temple_members SET role='abbot',active=true,display_name='Trụ trì' WHERE user_id='...';
