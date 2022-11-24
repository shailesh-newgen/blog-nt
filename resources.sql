CREATE TABLE resources ( id serial PRIMARY KEY, title text, banner_img text, short_desc text, resource_type_id integer references resource_type(id), industry_id integer references industry(id), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);