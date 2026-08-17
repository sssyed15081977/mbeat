-- UI language preference (interface chrome only, not user-generated post
-- content). Defaults to English; the LanguageToggle writes here once a user
-- is signed in, so the choice follows them across devices.
alter table profiles
  add column preferred_language text not null default 'en'
    check (preferred_language in ('en', 'ta'));
