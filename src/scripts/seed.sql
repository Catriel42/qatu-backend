-- USERS
insert into users (id, iam_id, email, full_name, role, is_active, email_verified, created_at, updated_at)
values
('11111111-1111-1111-1111-111111111111', 'seller-iam', 'seller@example.com', 'Seller Demo', 'seller', true, true, now(), now()),
('77777777-7777-7777-7777-777777777777', 'frontend-seller-iam', 'frontend-seller@example.com', 'Frontend Seller', 'seller', true, true, now(), now())
on conflict (id) do nothing;

-- STORES 
insert into stores (id, seller_id, name, slug, is_active, created_at, updated_at)
values
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Demo Store', 'demo-store', true, now(), now())
on conflict (id) do nothing;

-- CATEGORIES
insert into categories (id, name, slug, is_active, created_at, updated_at)
values
('33333333-3333-3333-3333-333333333333', 'Phones', 'phones', true, now(), now())
on conflict (id) do nothing;

-- PRODUCTS 
insert into products (id, store_id, category_id, name, slug, description, price, stock, sku, status, is_featured, average_rating, total_ratings, total_sales, views_count, created_at, updated_at)
values
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'iPhone 13', 'iphone-13', 'Like new', 699.00, 5, 'IP13-001', 'active', false, 0, 0, 0, 0, now(), now()),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Pixel 7', 'pixel-7', 'Open box', 499.00, 2, 'PX7-002', 'active', false, 0, 0, 0, 0, now(), now()),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Moto G', 'moto-g', 'Used', 120.00, 0, 'MG-003', 'draft', false, 0, 0, 0, 0, now(), now())
on conflict (id) do nothing;

-- PRODUCT IMAGES 
insert into product_images (id, product_id, image_url, alt_text, display_order, is_primary, created_at)
values
('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'https://picsum.photos/seed/iphone13/600/400', 'iphone13', 0, true, now()),
('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'https://picsum.photos/seed/pixel7/600/400', 'pixel7', 0, true, now())
on conflict (id) do nothing;
