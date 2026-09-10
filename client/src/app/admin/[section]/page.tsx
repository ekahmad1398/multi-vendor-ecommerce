"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getAdminOrders,
  getAdminUsers,
  updateAdminUser,
  updateCategory,
  updateOrderStatus,
} from "@/services/admin";
import { deleteProduct, getCategories, getProducts } from "@/services/catalog";
import { Button, EmptyState, ErrorState, Modal } from "@/components/ui/primitives";
import { toast } from "sonner";
import { money, orderCode } from "@/lib/format";
import type { Category } from "@/types";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const payments = ["pending", "paid", "failed", "refunded"];

export default function AdminSection() {
  const { section } = useParams<{ section: string }>();
  const client = useQueryClient();
  const userRole = section === "sellers" ? "seller" : "user";
  const [categoryForm, setCategoryForm] = useState<Category | { name: string; description?: string } | null>(null);

  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => getAdminOrders(), enabled: section === "orders" });
  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts({ limit: "100", isActive: "true" }),
    enabled: section === "products",
  });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories, enabled: section === "categories" });
  const users = useQuery({
    queryKey: ["admin-users", userRole],
    queryFn: () => getAdminUsers(userRole),
    enabled: section === "users" || section === "sellers",
  });

  const update = useMutation({
    mutationFn: ({ id, status, paymentStatus }: { id: string; status: string; paymentStatus?: string }) =>
      updateOrderStatus(id, status, paymentStatus),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-orders"] });
      client.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Order updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateUser = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { sellerStatus?: "active" | "suspended"; role?: "user" | "seller" | "admin" };
    }) => updateAdminUser(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const saveCategory = useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      if (categoryForm && "_id" in categoryForm) return updateCategory(categoryForm._id, payload);
      return createCategory(payload);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["categories"] });
      setCategoryForm(null);
      toast.success("Category saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const removeCategory = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const removeProduct = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!["products", "categories", "orders", "users", "sellers"].includes(section)) {
    return <div className="py-12">Admin section not found.</div>;
  }

  const title = section[0].toUpperCase() + section.slice(1);
  const loading =
    (section === "orders" && orders.isLoading) ||
    (section === "products" && products.isLoading) ||
    (section === "categories" && categories.isLoading) ||
    ((section === "users" || section === "sellers") && users.isLoading);
  const error =
    (section === "orders" && orders.isError) ||
    (section === "products" && products.isError) ||
    (section === "categories" && categories.isError) ||
    ((section === "users" || section === "sellers") && users.isError);

  return (
    <>
      <Link href="/admin" className="text-link">
        ← Overview
      </Link>
      <header className="mt-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Store administration</p>
          <h1 className="mt-2 font-serif text-5xl">{title}</h1>
        </div>
        {section === "categories" && (
          <Button className="btn-dark" onClick={() => setCategoryForm({ name: "", description: "" })}>
            New category
          </Button>
        )}
      </header>
      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
      ) : error ? (
        <div className="mt-8">
          <ErrorState />
        </div>
      ) : section === "orders" ? (
        <div className="table-wrap mt-8">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Placed</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.data?.orders?.map((order) => (
                <tr key={order._id}>
                  <td className="font-medium">{orderCode(order._id)}</td>
                  <td>{order.user?.name || "Customer"}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      aria-label={`Status for order ${order._id}`}
                      value={order.status}
                      onChange={(event) => update.mutate({ id: order._id, status: event.target.value })}
                      disabled={update.isPending || order.status === "cancelled"}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm capitalize"
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={`Payment for order ${order._id}`}
                      value={order.paymentStatus}
                      onChange={(event) =>
                        update.mutate({ id: order._id, status: order.status, paymentStatus: event.target.value })
                      }
                      disabled={update.isPending || order.status === "cancelled"}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm capitalize"
                    >
                      {payments.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right font-medium">{money(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : section === "products" ? (
        <div className="mt-8">
          {products.data?.products?.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th className="text-right">Price</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.data.products.map((product) => (
                    <tr key={product._id}>
                      <td className="font-medium">{product.name}</td>
                    <td>{product.category?.name}</td>
                      <td>{product.stock}</td>
                      <td className="text-right font-medium">{money(product.price * (1 - product.discount / 100))}</td>
                      <td className="text-right">
                        <Link href={`/products/${product._id}`} className="text-amber-800">
                          View
                        </Link>
                        <button onClick={() => removeProduct.mutate(product._id)} className="ml-4 text-rose-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No active products" description="Products added by sellers will appear here." />
          )}
        </div>
      ) : section === "categories" ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {categories.data?.map((category) => (
            <article key={category._id} className="card p-5">
              <p className="font-serif text-2xl">{category.name}</p>
              <p className="mt-2 text-sm text-slate-500">{category.description || "No description provided."}</p>
              <div className="mt-4 flex gap-3 text-sm">
                <button onClick={() => setCategoryForm(category)} className="text-amber-800">
                  Edit
                </button>
                <button onClick={() => removeCategory.mutate(category._id)} className="text-rose-600">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="table-wrap mt-8">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                {section === "sellers" && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {users.data?.users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        updateUser.mutate({ id: user._id, data: { role: event.target.value as "user" | "seller" | "admin" } })
                      }
                      disabled={updateUser.isPending}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm capitalize"
                    >
                      <option value="user">user</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  {section === "sellers" && (
                    <td>
                      <select
                        value={user.sellerStatus || "active"}
                        onChange={(event) =>
                          updateUser.mutate({
                            id: user._id,
                            data: { sellerStatus: event.target.value as "active" | "suspended" },
                          })
                        }
                        disabled={updateUser.isPending}
                        className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm capitalize"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(categoryForm)}
        onClose={() => setCategoryForm(null)}
        title={categoryForm && "_id" in categoryForm ? "Edit category" : "New category"}
      >
        {categoryForm && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              saveCategory.mutate({
                name: String(form.get("name") || ""),
                description: String(form.get("description") || ""),
              });
            }}
          >
            <label className="block text-sm font-medium">
              Name
              <input required name="name" defaultValue={categoryForm.name} className="input mt-2" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Description
              <textarea name="description" defaultValue={categoryForm.description} className="input mt-2 min-h-24" />
            </label>
            <Button loading={saveCategory.isPending} className="btn-dark mt-5 w-full">
              Save category
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
