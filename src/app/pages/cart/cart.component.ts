import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
import { loadStripe } from '@stripe/stripe-js';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [] };
  displayedColumns: string[] = [
    'product',
    'name',
    'price',
    'quantity',
    'total',
    'action',
  ];
  dataSource: CartItem[] = [];
  cartSubscription: Subscription | undefined;
  isLoading = false;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart.subscribe((_cart: Cart) => {
      this.cart = _cart;
      this.dataSource = _cart.items;
    });
  }

  getTotal(items: CartItem[]): number {
    return this.cartService.getTotal(items);
  }

  onAddQuantity(item: CartItem): void {
    this.cartService.addToCart(item);
  }

  onRemoveFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }

  onRemoveQuantity(item: CartItem): void {
    this.cartService.removeQuantity(item);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  async onCheckout(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Make sure we have items in the cart
      if (this.cart.items.length === 0) {
        this.snackBar.open('Your cart is empty', 'Close', { duration: 3000 });
        return;
      }

      console.log('Starting checkout process...');
      console.log('Cart items:', this.cart.items);

      // Create checkout session
      const response = await this.http
        .post('http://localhost:4242/checkout', {
          items: this.cart.items,
        })
        .toPromise();

      console.log('Checkout response:', response);

      // Load Stripe
      const stripe = await loadStripe('pk_test_51YOUR_PUBLISHABLE_KEY'); // Replace with your Stripe publishable key
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: (response as any).id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      let errorMessage = 'Failed to process checkout. ';
      if (error.status === 0) {
        errorMessage += 'Server is not running. Please start the backend server.';
      } else if (error.error?.message) {
        errorMessage += error.error.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
