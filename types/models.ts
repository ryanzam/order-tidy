export type Role = "owner" | "manager" | "waiter" | "kitchen";

export type Product = {
    _id: string;
    tenantId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    available: boolean;
};

export type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

export type Order = {
    _id: string;
    tenantId: string;
    tableNumber: string;
    customerName: string;
    items: OrderItem[];
    total: number;
    status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled";
    notes: string;
    createdAt: string;
};
