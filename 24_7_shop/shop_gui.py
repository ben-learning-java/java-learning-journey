#!/usr/bin/env python3
"""
24/7 Shop Management System with GUI
A standalone application for managing a convenience store
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from datetime import datetime
import json
import os

class ShopGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("24/7 Shop Management System")
        self.root.geometry("1000x700")

        # Data file path
        self.data_file = os.path.join(os.path.dirname(__file__), "shop_data.json")

        # Initialize data
        self.inventory = {}
        self.sales_history = []
        self.cart = {}

        # Load existing data
        self.load_data()

        # Create UI
        self.create_widgets()

    def create_widgets(self):
        # Create notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=10)

        # Sales Tab
        self.sales_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.sales_frame, text='Sales')
        self.create_sales_tab()

        # Inventory Tab
        self.inventory_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.inventory_frame, text='Inventory')
        self.create_inventory_tab()

        # Reports Tab
        self.reports_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.reports_frame, text='Reports')
        self.create_reports_tab()

    def create_sales_tab(self):
        # Left side - Product selection
        left_frame = ttk.Frame(self.sales_frame)
        left_frame.pack(side='left', fill='both', expand=True, padx=10, pady=10)

        ttk.Label(left_frame, text="Products", font=('Arial', 14, 'bold')).pack()

        # Search box
        search_frame = ttk.Frame(left_frame)
        search_frame.pack(fill='x', pady=5)
        ttk.Label(search_frame, text="Search:").pack(side='left')
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.filter_products)
        ttk.Entry(search_frame, textvariable=self.search_var).pack(side='left', fill='x', expand=True, padx=5)

        # Product listbox
        list_frame = ttk.Frame(left_frame)
        list_frame.pack(fill='both', expand=True, pady=5)

        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side='right', fill='y')

        self.product_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, font=('Arial', 11))
        self.product_listbox.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=self.product_listbox.yview)

        # Quantity and Add button
        qty_frame = ttk.Frame(left_frame)
        qty_frame.pack(fill='x', pady=5)
        ttk.Label(qty_frame, text="Quantity:").pack(side='left')
        self.qty_var = tk.StringVar(value="1")
        ttk.Entry(qty_frame, textvariable=self.qty_var, width=10).pack(side='left', padx=5)
        ttk.Button(qty_frame, text="Add to Cart", command=self.add_to_cart).pack(side='left', padx=5)

        # Right side - Cart
        right_frame = ttk.Frame(self.sales_frame)
        right_frame.pack(side='right', fill='both', expand=True, padx=10, pady=10)

        ttk.Label(right_frame, text="Shopping Cart", font=('Arial', 14, 'bold')).pack()

        # Cart display
        cart_frame = ttk.Frame(right_frame)
        cart_frame.pack(fill='both', expand=True, pady=5)

        cart_scroll = ttk.Scrollbar(cart_frame)
        cart_scroll.pack(side='right', fill='y')

        self.cart_text = tk.Text(cart_frame, yscrollcommand=cart_scroll.set, font=('Courier', 10), height=20)
        self.cart_text.pack(side='left', fill='both', expand=True)
        cart_scroll.config(command=self.cart_text.yview)

        # Total and buttons
        total_frame = ttk.Frame(right_frame)
        total_frame.pack(fill='x', pady=10)

        self.total_label = ttk.Label(total_frame, text="Total: $0.00", font=('Arial', 16, 'bold'))
        self.total_label.pack()

        button_frame = ttk.Frame(right_frame)
        button_frame.pack(fill='x')

        ttk.Button(button_frame, text="Clear Cart", command=self.clear_cart).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Complete Sale", command=self.complete_sale,
                   style='Accent.TButton').pack(side='right', padx=5)

        self.update_product_list()

    def create_inventory_tab(self):
        # Top frame for adding products
        top_frame = ttk.LabelFrame(self.inventory_frame, text="Add/Update Product", padding=10)
        top_frame.pack(fill='x', padx=10, pady=10)

        # Product fields
        fields_frame = ttk.Frame(top_frame)
        fields_frame.pack(fill='x')

        ttk.Label(fields_frame, text="Product Name:").grid(row=0, column=0, sticky='w', padx=5, pady=5)
        self.product_name_var = tk.StringVar()
        ttk.Entry(fields_frame, textvariable=self.product_name_var, width=30).grid(row=0, column=1, padx=5, pady=5)

        ttk.Label(fields_frame, text="Price ($):").grid(row=0, column=2, sticky='w', padx=5, pady=5)
        self.price_var = tk.StringVar()
        ttk.Entry(fields_frame, textvariable=self.price_var, width=15).grid(row=0, column=3, padx=5, pady=5)

        ttk.Label(fields_frame, text="Stock:").grid(row=1, column=0, sticky='w', padx=5, pady=5)
        self.stock_var = tk.StringVar()
        ttk.Entry(fields_frame, textvariable=self.stock_var, width=15).grid(row=1, column=1, padx=5, pady=5)

        ttk.Label(fields_frame, text="Barcode:").grid(row=1, column=2, sticky='w', padx=5, pady=5)
        self.barcode_var = tk.StringVar()
        ttk.Entry(fields_frame, textvariable=self.barcode_var, width=15).grid(row=1, column=3, padx=5, pady=5)

        button_frame = ttk.Frame(top_frame)
        button_frame.pack(fill='x', pady=10)

        ttk.Button(button_frame, text="Add Product", command=self.add_product).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Update Selected", command=self.update_product).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Delete Selected", command=self.delete_product).pack(side='left', padx=5)
        ttk.Button(button_frame, text="Clear Fields", command=self.clear_product_fields).pack(side='left', padx=5)

        # Inventory tree
        tree_frame = ttk.LabelFrame(self.inventory_frame, text="Current Inventory", padding=10)
        tree_frame.pack(fill='both', expand=True, padx=10, pady=10)

        # Create treeview
        columns = ('Name', 'Price', 'Stock', 'Barcode')
        self.inventory_tree = ttk.Treeview(tree_frame, columns=columns, show='headings', height=15)

        for col in columns:
            self.inventory_tree.heading(col, text=col)
            self.inventory_tree.column(col, width=150)

        tree_scroll = ttk.Scrollbar(tree_frame, orient='vertical', command=self.inventory_tree.yview)
        self.inventory_tree.configure(yscrollcommand=tree_scroll.set)

        self.inventory_tree.pack(side='left', fill='both', expand=True)
        tree_scroll.pack(side='right', fill='y')

        self.inventory_tree.bind('<<TreeviewSelect>>', self.on_inventory_select)

        self.update_inventory_tree()

    def create_reports_tab(self):
        # Date filters
        filter_frame = ttk.LabelFrame(self.reports_frame, text="Filters", padding=10)
        filter_frame.pack(fill='x', padx=10, pady=10)

        ttk.Label(filter_frame, text="Show sales from:").pack(side='left', padx=5)
        self.report_filter = tk.StringVar(value="today")
        ttk.Radiobutton(filter_frame, text="Today", variable=self.report_filter,
                        value="today", command=self.update_reports).pack(side='left')
        ttk.Radiobutton(filter_frame, text="This Week", variable=self.report_filter,
                        value="week", command=self.update_reports).pack(side='left')
        ttk.Radiobutton(filter_frame, text="All Time", variable=self.report_filter,
                        value="all", command=self.update_reports).pack(side='left')

        # Reports display
        report_display_frame = ttk.Frame(self.reports_frame)
        report_display_frame.pack(fill='both', expand=True, padx=10, pady=10)

        self.report_text = scrolledtext.ScrolledText(report_display_frame, font=('Courier', 10))
        self.report_text.pack(fill='both', expand=True)

        self.update_reports()

    def filter_products(self, *args):
        self.update_product_list()

    def update_product_list(self):
        self.product_listbox.delete(0, tk.END)
        search_term = self.search_var.get().lower()

        for name, details in sorted(self.inventory.items()):
            if search_term in name.lower():
                display = f"{name} - ${details['price']:.2f} (Stock: {details['stock']})"
                self.product_listbox.insert(tk.END, display)

    def add_to_cart(self):
        selection = self.product_listbox.curselection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a product")
            return

        product_text = self.product_listbox.get(selection[0])
        product_name = product_text.split(' - ')[0]

        try:
            qty = int(self.qty_var.get())
            if qty <= 0:
                raise ValueError()
        except ValueError:
            messagebox.showerror("Invalid Quantity", "Please enter a valid quantity")
            return

        if product_name not in self.inventory:
            messagebox.showerror("Error", "Product not found")
            return

        if self.inventory[product_name]['stock'] < qty:
            messagebox.showerror("Insufficient Stock",
                               f"Only {self.inventory[product_name]['stock']} items available")
            return

        if product_name in self.cart:
            self.cart[product_name] += qty
        else:
            self.cart[product_name] = qty

        self.update_cart_display()

    def update_cart_display(self):
        self.cart_text.delete('1.0', tk.END)
        total = 0

        self.cart_text.insert(tk.END, f"{'ITEM':<30} {'QTY':<8} {'PRICE':<10} {'TOTAL':<10}\n")
        self.cart_text.insert(tk.END, "-" * 60 + "\n")

        for name, qty in self.cart.items():
            price = self.inventory[name]['price']
            item_total = price * qty
            total += item_total

            self.cart_text.insert(tk.END,
                f"{name:<30} {qty:<8} ${price:<9.2f} ${item_total:<9.2f}\n")

        self.cart_text.insert(tk.END, "-" * 60 + "\n")
        self.total_label.config(text=f"Total: ${total:.2f}")

    def clear_cart(self):
        self.cart = {}
        self.update_cart_display()

    def complete_sale(self):
        if not self.cart:
            messagebox.showwarning("Empty Cart", "Add items to cart before completing sale")
            return

        total = sum(self.inventory[name]['price'] * qty for name, qty in self.cart.items())

        # Update inventory
        for name, qty in self.cart.items():
            self.inventory[name]['stock'] -= qty

        # Record sale
        sale = {
            'timestamp': datetime.now().isoformat(),
            'items': dict(self.cart),
            'total': total
        }
        self.sales_history.append(sale)

        # Save and update displays
        self.save_data()
        self.clear_cart()
        self.update_product_list()
        self.update_inventory_tree()
        self.update_reports()

        messagebox.showinfo("Sale Complete", f"Sale completed!\nTotal: ${total:.2f}")

    def add_product(self):
        name = self.product_name_var.get().strip()

        if not name:
            messagebox.showerror("Error", "Product name is required")
            return

        try:
            price = float(self.price_var.get())
            stock = int(self.stock_var.get())
            if price < 0 or stock < 0:
                raise ValueError()
        except ValueError:
            messagebox.showerror("Error", "Invalid price or stock value")
            return

        barcode = self.barcode_var.get().strip()

        self.inventory[name] = {
            'price': price,
            'stock': stock,
            'barcode': barcode
        }

        self.save_data()
        self.clear_product_fields()
        self.update_product_list()
        self.update_inventory_tree()

        messagebox.showinfo("Success", f"Product '{name}' added successfully")

    def update_product(self):
        selection = self.inventory_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a product to update")
            return

        old_name = self.inventory_tree.item(selection[0])['values'][0]
        new_name = self.product_name_var.get().strip()

        if not new_name:
            messagebox.showerror("Error", "Product name is required")
            return

        try:
            price = float(self.price_var.get())
            stock = int(self.stock_var.get())
            if price < 0 or stock < 0:
                raise ValueError()
        except ValueError:
            messagebox.showerror("Error", "Invalid price or stock value")
            return

        barcode = self.barcode_var.get().strip()

        # Remove old entry if name changed
        if old_name != new_name and old_name in self.inventory:
            del self.inventory[old_name]

        self.inventory[new_name] = {
            'price': price,
            'stock': stock,
            'barcode': barcode
        }

        self.save_data()
        self.clear_product_fields()
        self.update_product_list()
        self.update_inventory_tree()

        messagebox.showinfo("Success", "Product updated successfully")

    def delete_product(self):
        selection = self.inventory_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a product to delete")
            return

        name = self.inventory_tree.item(selection[0])['values'][0]

        if messagebox.askyesno("Confirm Delete", f"Delete product '{name}'?"):
            del self.inventory[name]
            self.save_data()
            self.clear_product_fields()
            self.update_product_list()
            self.update_inventory_tree()

    def clear_product_fields(self):
        self.product_name_var.set("")
        self.price_var.set("")
        self.stock_var.set("")
        self.barcode_var.set("")

    def on_inventory_select(self, event):
        selection = self.inventory_tree.selection()
        if selection:
            values = self.inventory_tree.item(selection[0])['values']
            self.product_name_var.set(values[0])
            self.price_var.set(str(values[1]))
            self.stock_var.set(str(values[2]))
            self.barcode_var.set(values[3])

    def update_inventory_tree(self):
        # Clear existing items
        for item in self.inventory_tree.get_children():
            self.inventory_tree.delete(item)

        # Add all products
        for name, details in sorted(self.inventory.items()):
            self.inventory_tree.insert('', tk.END, values=(
                name,
                f"${details['price']:.2f}",
                details['stock'],
                details.get('barcode', '')
            ))

    def update_reports(self):
        self.report_text.delete('1.0', tk.END)

        filter_type = self.report_filter.get()
        now = datetime.now()

        filtered_sales = []
        for sale in self.sales_history:
            sale_date = datetime.fromisoformat(sale['timestamp'])

            if filter_type == "today":
                if sale_date.date() == now.date():
                    filtered_sales.append(sale)
            elif filter_type == "week":
                if (now - sale_date).days <= 7:
                    filtered_sales.append(sale)
            else:  # all
                filtered_sales.append(sale)

        # Generate report
        self.report_text.insert(tk.END, "=" * 80 + "\n")
        self.report_text.insert(tk.END, f"SALES REPORT - {filter_type.upper()}\n")
        self.report_text.insert(tk.END, f"Generated: {now.strftime('%Y-%m-%d %H:%M:%S')}\n")
        self.report_text.insert(tk.END, "=" * 80 + "\n\n")

        if not filtered_sales:
            self.report_text.insert(tk.END, "No sales to display.\n")
            return

        total_revenue = sum(sale['total'] for sale in filtered_sales)

        self.report_text.insert(tk.END, f"Total Sales: {len(filtered_sales)}\n")
        self.report_text.insert(tk.END, f"Total Revenue: ${total_revenue:.2f}\n\n")

        # Product breakdown
        product_sales = {}
        for sale in filtered_sales:
            for item, qty in sale['items'].items():
                if item not in product_sales:
                    product_sales[item] = 0
                product_sales[item] += qty

        self.report_text.insert(tk.END, "TOP SELLING PRODUCTS:\n")
        self.report_text.insert(tk.END, "-" * 80 + "\n")

        for product, qty in sorted(product_sales.items(), key=lambda x: x[1], reverse=True):
            if product in self.inventory:
                revenue = qty * self.inventory[product]['price']
                self.report_text.insert(tk.END,
                    f"{product:<40} Qty: {qty:<6} Revenue: ${revenue:.2f}\n")

        # Recent transactions
        self.report_text.insert(tk.END, "\n\nRECENT TRANSACTIONS:\n")
        self.report_text.insert(tk.END, "-" * 80 + "\n")

        for sale in reversed(filtered_sales[-10:]):
            sale_date = datetime.fromisoformat(sale['timestamp'])
            self.report_text.insert(tk.END,
                f"{sale_date.strftime('%Y-%m-%d %H:%M')} - ${sale['total']:.2f}\n")
            for item, qty in sale['items'].items():
                self.report_text.insert(tk.END, f"  - {item} x{qty}\n")
            self.report_text.insert(tk.END, "\n")

    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    data = json.load(f)
                    self.inventory = data.get('inventory', {})
                    self.sales_history = data.get('sales_history', [])
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load data: {e}")
        else:
            # Initialize with sample data
            self.inventory = {
                "Coca Cola 500ml": {"price": 2.50, "stock": 50, "barcode": "123456"},
                "Water 1L": {"price": 1.50, "stock": 100, "barcode": "123457"},
                "Bread": {"price": 3.00, "stock": 30, "barcode": "123458"},
                "Milk 1L": {"price": 4.00, "stock": 40, "barcode": "123459"},
                "Chips": {"price": 2.00, "stock": 75, "barcode": "123460"},
            }

    def save_data(self):
        data = {
            'inventory': self.inventory,
            'sales_history': self.sales_history
        }

        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)

            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save data: {e}")


def main():
    root = tk.Tk()

    # Style configuration
    style = ttk.Style()
    style.theme_use('aqua' if root.tk.call('tk', 'windowingsystem') == 'aqua' else 'clam')

    app = ShopGUI(root)

    # Save on close
    def on_closing():
        app.save_data()
        root.destroy()

    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()


if __name__ == "__main__":
    main()
