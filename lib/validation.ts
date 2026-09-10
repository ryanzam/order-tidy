import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().default(""),
    price: z.number().nonnegative(),
    category: z.string().min(1),
    imageUrl: z.url().or(z.literal("")).default(""),
    available: z.boolean().default(true),
});

export const orderSchema = z.object({
    tenantSlug: z.string(),
    tableNumber: z.string().min(1),
    customerName: z.string().min(1),
    items: z
        .array(
            z.object({
                productId: z.string(),
                quantity: z.number().int().positive(),
            }),
        )
        .min(1),
    notes: z.string().optional().default(""),
});

export const staffSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    phone: z.string(),
    password: z.string().min(8),
    role: z.enum(["manager", "waiter", "kitchen"]),
});

export const settingsSchema = z.object({
    name: z.string().min(2),
    description: z.string().default(""),
    logoUrl: z.url().or(z.literal("")).default(""),
    currency: z.string().min(1).max(5).default("NPR"),
});
