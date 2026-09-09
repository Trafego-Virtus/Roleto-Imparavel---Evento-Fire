export interface Product {
  id: string;
  name: string;
  tagline: string;
  color: string;
  textColor: string;
  accentColor: string;
  iconName: string;
}

export interface SpinResult {
  product: Product;
  timestamp: number;
}
