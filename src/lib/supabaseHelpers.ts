import { supabase } from "@/integrations/supabase/client";

export interface ProductGroup {
  id: string;
  name: string;
  image_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number | null;
  group_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_groups?: ProductGroup;
}

export interface Table {
  id: number;
  name: string;
  is_occupied: boolean;
  opened_at: string | null;
  opened_by?: string | null;
  last_modified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TableItem {
  id: string;
  table_id: number;
  product_id: string;
  product_name: string;
  product_price: number | null;
  quantity: number;
  added_by?: string | null;
  created_at: string;
  products?: Product;
}

export interface Transaction {
  id: string;
  table_id: number;
  table_name: string;
  total_amount: number;
  items: any;
  completed_at: string;
  opened_by?: string | null;
  closed_by?: string | null;
  items_added_by?: any;
}

export interface TransactionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface CreateTransactionData {
  table_id: number;
  table_name: string;
  total_amount: number;
  items: TransactionItem[];
  opened_by?: string;
  closed_by?: string;
  items_added_by?: any;
}

// Kullanıcı bilgisini localStorage'dan al
const getCurrentUser = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    const parsed = JSON.parse(authData);
    return parsed.username || 'bilinmeyen';
  }
  return 'bilinmeyen';
};

// Product Groups
export const getProductGroups = async (): Promise<ProductGroup[]> => {
  const { data, error } = await supabase
    .from("product_groups")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createProductGroup = async (group: Omit<ProductGroup, "id" | "created_at" | "updated_at">): Promise<ProductGroup> => {
  const { data, error } = await supabase
    .from("product_groups")
    .insert(group)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProductGroup = async (id: string, updates: Partial<ProductGroup>): Promise<ProductGroup> => {
  const { data, error } = await supabase
    .from("product_groups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProductGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("product_groups")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_groups (*)
    `)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};

export const getProductsByGroup = async (groupId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
};

export const createProduct = async (product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Tables
export const getTables = async (): Promise<Table[]> => {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .order("id");

  if (error) throw error;
  return data || [];
};

export const getTable = async (id: number): Promise<Table> => {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateTableStatus = async (
  id: number, 
  isOccupied: boolean, 
  openedAt: string | null
): Promise<void> => {
  const currentUser = getCurrentUser();
  
  const updates: any = {
    is_occupied: isOccupied,
    opened_at: openedAt,
    updated_at: new Date().toISOString(),
    last_modified_by: currentUser
  };

  // Masa açılıyorsa opened_by'ı set et
  if (isOccupied && openedAt) {
    updates.opened_by = currentUser;
  }

  const { error } = await supabase
    .from("tables")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
};

// Table Items
export const getTableItems = async (tableId: number): Promise<TableItem[]> => {
  const { data, error } = await supabase
    .from("table_items")
    .select(`
      *,
      products (*)
    `)
    .eq("table_id", tableId)
    .order("created_at");

  if (error) throw error;
  return data || [];
};

export const addTableItem = async (item: Omit<TableItem, "id" | "created_at">): Promise<TableItem> => {
  const currentUser = getCurrentUser();
  
  const { data, error } = await supabase
    .from("table_items")
    .insert({
      ...item,
      added_by: currentUser
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTableItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("table_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const clearTableItems = async (tableId: number): Promise<void> => {
  const { error } = await supabase
    .from("table_items")
    .delete()
    .eq("table_id", tableId);

  if (error) throw error;
};

// Transactions
export const getTransactions = async (startDate?: Date, endDate?: Date): Promise<Transaction[]> => {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("completed_at", { ascending: false });

  if (startDate && endDate) {
    query = query
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createTransaction = async (transactionData: CreateTransactionData): Promise<Transaction> => {
  const currentUser = getCurrentUser();
  
  // Masayı açan kullanıcıyı al
  const { data: tableData } = await supabase
    .from("tables")
    .select("opened_by")
    .eq("id", transactionData.table_id)
    .single();

  // Ürün ekleyen kullanıcıları al
  const { data: itemsData } = await supabase
    .from("table_items")
    .select("added_by, product_name, quantity")
    .eq("table_id", transactionData.table_id);

  // Ürün ekleyen kullanıcıları grupla
  const itemsAddedBy = itemsData?.reduce((acc: any, item) => {
    const user = item.added_by || 'bilinmeyen';
    if (!acc[user]) {
      acc[user] = [];
    }
    acc[user].push({
      product: item.product_name,
      quantity: item.quantity
    });
    return acc;
  }, {}) || {};

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      table_id: transactionData.table_id,
      table_name: transactionData.table_name,
      total_amount: transactionData.total_amount,
      items: transactionData.items as any,
      completed_at: new Date().toISOString(),
      opened_by: tableData?.opened_by || 'bilinmeyen',
      closed_by: currentUser,
      items_added_by: itemsAddedBy as any
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Media Library
export const uploadFile = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  // Save to media library
  const { error: dbError } = await supabase
    .from('media_library')
    .insert({
      file_name: file.name,
      file_url: data.publicUrl,
      file_size: file.size,
      mime_type: file.type,
    });

  if (dbError) throw dbError;

  return data.publicUrl;
};

export const getMediaFiles = async () => {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteMediaFile = async (id: string, fileUrl: string) => {
  // Extract file path from URL
  const urlParts = fileUrl.split('/');
  const filePath = `uploads/${urlParts[urlParts.length - 1]}`;

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('media')
    .remove([filePath]);

  if (storageError) throw storageError;

  // Delete from database
  const { error: dbError } = await supabase
    .from('media_library')
    .delete()
    .eq('id', id);

  if (dbError) throw dbError;
};

// Table Management Functions
export const createTable = async (table: { id: number; name: string }): Promise<Table> => {
  const { data, error } = await supabase
    .from("tables")
    .insert({
      id: table.id,
      name: table.name,
      is_occupied: false,
      opened_at: null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTableName = async (id: number, name: string): Promise<void> => {
  const { error } = await supabase
    .from("tables")
    .update({ name })
    .eq("id", id);

  if (error) throw error;
};

export const deleteTable = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// Product Management Functions
export const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_groups (*)
    `)
    .order("name");

  if (error) throw error;
  return data || [];
};

// Transaction Item Management
export const deleteTransactionItem = async (transactionId: string, itemIndex: number): Promise<void> => {
  const { data: transaction, error: fetchError } = await supabase
    .from("transactions")
    .select("items, total_amount")
    .eq("id", transactionId)
    .single();

  if (fetchError) throw fetchError;

  const items = Array.isArray(transaction.items) ? transaction.items : [];
  const deletedItem = items[itemIndex];
  const updatedItems = items.filter((_: any, index: number) => index !== itemIndex);
  
  // Calculate new total
  const newTotal = updatedItems.reduce((sum: number, item: any) => {
    return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
  }, 0);

  const { error: updateError } = await supabase
    .from("transactions")
    .update({ 
      items: updatedItems as any,
      total_amount: Number(newTotal)
    })
    .eq("id", transactionId);

  if (updateError) throw updateError;
};

// Audit Log Types
export interface AuditLog {
  id: string;
  edit_type: string;
  edited_by: string;
  created_at: string;
  description: string;
  old_value: any;
  new_value: any;
}

// Audit Log Functions
export const createAuditLog = async (log: Omit<AuditLog, "id" | "created_at">): Promise<void> => {
  const { error } = await supabase
    .from("audit_logs")
    .insert({
      edit_type: log.edit_type,
      edited_by: log.edited_by,
      description: log.description,
      old_value: log.old_value as any,
      new_value: log.new_value as any,
    });

  if (error) throw error;
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as AuditLog[];
};

// Media Library Types and Functions
export interface MediaLibraryItem {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export const getMediaLibrary = async (): Promise<MediaLibraryItem[]> => {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addMediaToLibrary = async (file: File): Promise<string> => {
  return await uploadFile(file);
};

export const deleteMediaFromLibrary = async (id: string, fileUrl: string): Promise<void> => {
  await deleteMediaFile(id, fileUrl);
};
