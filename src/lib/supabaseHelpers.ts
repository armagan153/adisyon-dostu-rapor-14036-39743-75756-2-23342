import { supabase } from '@/integrations/supabase/client';

// Type imports
export type ProductGroup = {
  id: string;
  name: string;
  image_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  price: number | null;
  group_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_groups?: ProductGroup;
};

export type Table = {
  id: number;
  name: string;
  is_occupied: boolean;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TableItem = {
  id: string;
  table_id: number;
  product_id: string;
  product_name: string;
  product_price: number | null;
  quantity: number;
  created_at: string;
  products?: Product;
};

export type Transaction = {
  id: string;
  table_id: number;
  table_name: string;
  total_amount: number;
  items: any;
  completed_at: string;
};

export type MediaLibraryItem = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
  created_at: string;
};

// Storage Operations
export async function uploadProductGroupImage(file: File, groupId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${groupId}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from('product-group-images')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-group-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductGroupImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;
  
  const path = imageUrl.split('/product-group-images/').pop();
  if (!path) return;

  await supabase.storage
    .from('product-group-images')
    .remove([path]);
}

// Product Group Operations
export async function getProductGroups(): Promise<ProductGroup[]> {
  const { data, error } = await supabase
    .from('product_groups')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createProductGroup(data: {
  name: string;
  image_url?: string;
  order_index?: number;
}): Promise<ProductGroup> {
  const { data: result, error } = await supabase
    .from('product_groups')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateProductGroup(
  id: string,
  data: Partial<ProductGroup>
): Promise<void> {
  const { error } = await supabase
    .from('product_groups')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProductGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Product Operations
export async function getProducts(groupId?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, product_groups(*)')
    .eq('is_active', true)
    .order('name');

  if (groupId) {
    query = query.eq('group_id', groupId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_groups(*)')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createProduct(data: {
  name: string;
  price?: number;
  group_id: string;
  is_active?: boolean;
}): Promise<Product> {
  const { data: result, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Table Operations
export async function getTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('id');

  if (error) throw error;
  return data || [];
}

export async function getTable(id: number): Promise<Table | null> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTableStatus(
  id: number,
  isOccupied: boolean,
  openedAt?: string | null
): Promise<void> {
  const { error } = await supabase
    .from('tables')
    .update({
      is_occupied: isOccupied,
      opened_at: openedAt,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function createTable(data: {
  id: number;
  name: string;
}): Promise<Table> {
  const { data: result, error } = await supabase
    .from('tables')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateTableName(id: number, name: string): Promise<void> {
  const { error } = await supabase
    .from('tables')
    .update({ name })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTable(id: number): Promise<void> {
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Table Items Operations
export async function getTableItems(tableId: number): Promise<TableItem[]> {
  const { data, error } = await supabase
    .from('table_items')
    .select('*, products(*)')
    .eq('table_id', tableId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function addTableItem(data: {
  table_id: number;
  product_id: string;
  product_name: string;
  product_price: number | null;
  quantity: number;
}): Promise<TableItem> {
  const { data: result, error } = await supabase
    .from('table_items')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateTableItemQuantity(
  id: string,
  quantity: number
): Promise<void> {
  const { error } = await supabase
    .from('table_items')
    .update({ quantity })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteTableItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('table_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function clearTableItems(tableId: number): Promise<void> {
  const { error } = await supabase
    .from('table_items')
    .delete()
    .eq('table_id', tableId);

  if (error) throw error;
}

// Transaction Operations
export async function createTransaction(data: {
  table_id: number;
  table_name: string;
  total_amount: number;
  items: any;
}): Promise<Transaction> {
  const { data: result, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getTransactions(
  startDate?: Date,
  endDate?: Date
): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('completed_at', { ascending: false });

  if (startDate) {
    query = query.gte('completed_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('completed_at', endDate.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTodayTransactions(): Promise<Transaction[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getTransactions(today, tomorrow);
}

// Media Library Operations
export async function getMediaLibrary(): Promise<MediaLibraryItem[]> {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addMediaToLibrary(file: File): Promise<MediaLibraryItem> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('product-group-images')
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-group-images')
    .getPublicUrl(fileName);

  const { data: result, error } = await supabase
    .from('media_library')
    .insert({
      file_name: file.name,
      file_url: data.publicUrl,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteMediaFromLibrary(id: string, imageUrl: string): Promise<void> {
  const path = imageUrl.split('/product-group-images/').pop();
  if (path) {
    await supabase.storage
      .from('product-group-images')
      .remove([path]);
  }

  const { error } = await supabase
    .from('media_library')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
