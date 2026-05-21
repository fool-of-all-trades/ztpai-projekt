alter table stories
    add constraint uk_stories_author_prompt_date unique (author_id, prompt_date);
