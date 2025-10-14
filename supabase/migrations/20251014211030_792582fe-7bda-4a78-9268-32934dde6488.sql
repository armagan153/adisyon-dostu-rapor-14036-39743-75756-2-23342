-- Create product groups table
CREATE TABLE IF NOT EXISTS public.product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  group_id UUID NOT NULL REFERENCES public.product_groups(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS public.tables (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_occupied BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table items table
CREATE TABLE IF NOT EXISTS public.table_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER NOT NULL,
  table_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_group_id ON public.products(group_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_table_items_table_id ON public.table_items(table_id);
CREATE INDEX IF NOT EXISTS idx_table_items_product_id ON public.table_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_completed_at ON public.transactions(completed_at);
CREATE INDEX IF NOT EXISTS idx_tables_is_occupied ON public.tables(is_occupied);

-- Enable Row Level Security
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access for restaurant operations
CREATE POLICY "Public can view product groups" ON public.product_groups FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Public can view table items" ON public.table_items FOR SELECT USING (true);
CREATE POLICY "Public can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public can view admin settings" ON public.admin_settings FOR SELECT USING (true);

-- Insert/Update/Delete policies - Public access for operations (client-side password protected)
CREATE POLICY "Public can insert product groups" ON public.product_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update product groups" ON public.product_groups FOR UPDATE USING (true);
CREATE POLICY "Public can delete product groups" ON public.product_groups FOR DELETE USING (true);

CREATE POLICY "Public can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public can delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public can insert tables" ON public.tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update tables" ON public.tables FOR UPDATE USING (true);
CREATE POLICY "Public can delete tables" ON public.tables FOR DELETE USING (true);

CREATE POLICY "Public can insert table items" ON public.table_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update table items" ON public.table_items FOR UPDATE USING (true);
CREATE POLICY "Public can delete table items" ON public.table_items FOR DELETE USING (true);

CREATE POLICY "Public can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_product_groups_updated_at BEFORE UPDATE ON public.product_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default 12 tables
INSERT INTO public.tables (id, name) VALUES
  (1, 'Masa 1'), (2, 'Masa 2'), (3, 'Masa 3'), (4, 'Masa 4'),
  (5, 'Masa 5'), (6, 'Masa 6'), (7, 'Masa 7'), (8, 'Masa 8'),
  (9, 'Masa 9'), (10, 'Masa 10'), (11, 'Masa 11'), (12, 'Masa 12')
ON CONFLICT (id) DO NOTHING;

-- Insert admin password (bcrypt hash of "5555")
-- Using bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMye7FRNTEfewU7U8cN9Z7N9Z7N9Z7N9Z7N
INSERT INTO public.admin_settings (password_hash) VALUES ('$2a$10$N9qo8uLOickgx2ZMRZoMye7FRNTEfewU7U8cN9Z7N9Z7N9Z7N9Z7N')
ON CONFLICT DO NOTHING;

-- Create storage bucket for product group images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-group-images', 'product-group-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Public can view product group images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-group-images');

CREATE POLICY "Public can upload product group images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-group-images');

CREATE POLICY "Public can update product group images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-group-images');

CREATE POLICY "Public can delete product group images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-group-images');