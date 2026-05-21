alter table stories
    add column prompt_date date not null default current_date;

create index idx_stories_prompt_date on stories (prompt_date);
