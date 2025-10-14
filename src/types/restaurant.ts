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
}
