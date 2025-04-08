import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

// Example products array (you can expand this list as needed)
const PRODUCTS: Array<Product> = [
  {
    id: 1,
    title: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'electronics',
    image: 'https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg',
  },
  {
    id: 2,
    title: 'Smart Watch',
    price: 199.99,
    description: 'Fitness tracking smartwatch with heart rate monitoring',
    category: 'electronics',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
  },
  {
    id: 3,
    title: 'Leather Wallet',
    price: 49.99,
    description: 'Genuine leather wallet with multiple card slots',
    category: 'fashion',
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
  },
  {
    id: 4,
    title: 'Running Shoes',
    price: 79.99,
    description: 'Comfortable running shoes for professional athletes',
    category: 'fashion',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
  },
  {
    id: 5,
    title: 'Coffee Maker',
    price: 129.99,
    description: 'Programmable coffee maker with thermal carafe',
    category: 'home',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
  },
  {
    id: 6,
    title: 'Yoga Mat',
    price: 29.99,
    description: 'Premium non-slip yoga mat with carrying strap',
    category: 'sports',
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg',
  },
  {
    id: 7,
    title: 'Laptop Backpack',
    price: 59.99,
    description: 'Water-resistant laptop backpack with USB charging port',
    category: 'accessories',
    image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
  },
  {
    id: 8,
    title: 'Wireless Mouse',
    price: 39.99,
    description: 'Ergonomic wireless mouse with precision tracking',
    category: 'electronics',
    image: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg',
  }
];

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor() {}

  getAllProducts(
    limit: number = 12,
    sort: 'asc' | 'desc' = 'desc',
    category?: string
  ): Observable<Array<Product>> {
    let products = [...PRODUCTS];

    // Filter by category if provided
    if (category) {
      products = products.filter((product) => product.category === category);
    }

    // Sort the products by price
    products.sort((a, b) =>
      sort === 'asc' ? a.price - b.price : b.price - a.price
    );

    // Limit the number of products
    products = products.slice(0, limit);

    return of(products);
  }

  getAllCategories(): Observable<Array<string>> {
    // Extract unique categories from the products array
    const categories = Array.from(
      new Set(PRODUCTS.map((product) => product.category))
    );
    return of(categories);
  }
}
