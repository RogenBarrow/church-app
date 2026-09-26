-- Functions in the public schema are callable via /rest/v1/rpc/... by default.

-- handle_new_user() is only for the trigger: nobody may call it directly.
-- (Triggers keep working: EXECUTE is only checked when the trigger is created.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_pastor() is used inside RLS policies, which run as the requesting user,
-- so logged-in users need EXECUTE. Visitors who aren't logged in don't.
revoke execute on function public.is_pastor() from public, anon;
