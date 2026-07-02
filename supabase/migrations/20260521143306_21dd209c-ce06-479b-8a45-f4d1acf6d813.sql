
ALTER FUNCTION public.set_updated_at() SET search_path = public;

DROP POLICY "Authenticated can update leads" ON public.leads;
DROP POLICY "Authenticated can delete leads" ON public.leads;
CREATE POLICY "Authenticated can update leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete leads" ON public.leads FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
