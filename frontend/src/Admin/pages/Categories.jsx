import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    RefreshCw,
    Layers,
} from "lucide-react";
import { API_ORIGIN } from "../../api/axios";

const API_URL = API_ORIGIN;

const inputStyle = {
    borderColor: "#d4c5b0",
    background: "#fff",
    color: "#1b4332",
    outline: "none",
};

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState({ name: "", description: "", is_active: true, image: null });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("admin_access");
            const res = await fetch(`${API_URL}/api/products/admin/categories/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setCategories(data.results || data);
        } catch {
            setError("Unable to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchCategories();
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);

    const openAddModal = () => {
        setEditingCategory(null);
        setForm({ name: "", description: "", is_active: true, image: null });
        setError("");
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setForm({ name: category.name || "", description: category.description || "", is_active: category.is_active ?? true, image: null });
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingCategory(null);
        setError("");
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "file" ? files?.[0] || null : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Category name is required."); return; }

        try {
            setSaving(true);
            setError("");
            const token = localStorage.getItem("admin_access");
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("is_active", form.is_active ? "true" : "false");
            if (form.image) formData.append("image", form.image);

            const url = editingCategory
                ? `${API_URL}/api/products/admin/categories/${editingCategory.id}/`
                : `${API_URL}/api/products/admin/categories/`;
            const method = editingCategory ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Failed to save category.");
                return;
            }

            setShowModal(false);
            setEditingCategory(null);
            await fetchCategories();
        } catch {
            setError("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        if (!window.confirm(`Delete category "${category.name}"?`)) return;
        try {
            const token = localStorage.getItem("admin_access");
            const res = await fetch(`${API_URL}/api/products/admin/categories/${category.id}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) { alert("Failed to delete."); return; }
            setCategories((prev) => prev.filter((c) => c.id !== category.id));
        } catch {
            alert("Something went wrong.");
        }
    };

    const filtered = categories.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#a48755", letterSpacing: "0.18em" }}>
                        Catalogue
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: "#1b4332" }}>
                        Categories
                    </h1>
                    <p className="mt-0.5 text-sm" style={{ color: "#493d38" }}>
                        Manage product categories for your store
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    style={{ background: "#1b4332" }}
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* Error */}
            {error && !showModal && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Search + Refresh */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 max-w-sm">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#a48755" }} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                        onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                    />
                </div>

                <button
                    onClick={fetchCategories}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition hover:bg-white disabled:opacity-50"
                    style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                >
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm" style={{ color: "#a48755" }}>
                        <RefreshCw size={18} className="mr-2 animate-spin" />
                        Loading categories...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead style={{ background: "#faf9f6" }}>
                                <tr>
                                    {["Category", "Description", "Status", "Actions"].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${i === 3 ? "text-right" : "text-left"}`}
                                            style={{ color: "#a48755", letterSpacing: "0.1em" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-20 text-center">
                                            <Layers size={36} className="mx-auto mb-3" style={{ color: "#d4c5b0" }} />
                                            <p className="text-sm" style={{ color: "#493d38" }}>
                                                No categories found.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="border-t transition hover:bg-[#fdfaf7]"
                                            style={{ borderColor: "#f0e8dc" }}
                                        >
                                            {/* Category */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-12 w-12 overflow-hidden rounded-xl border flex-shrink-0"
                                                        style={{ borderColor: "#e8e0d5" }}
                                                    >
                                                        {category.image ? (
                                                            <img
                                                                src={category.image}
                                                                alt={category.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="flex h-full w-full items-center justify-center"
                                                                style={{ background: "#f8f4ec" }}
                                                            >
                                                                <Layers size={18} style={{ color: "#a48755" }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm" style={{ color: "#1b4332" }}>
                                                            {category.name}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "#a48755" }}>
                                                            #{category.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="max-w-xs px-5 py-4">
                                                <p className="truncate text-sm" style={{ color: "#493d38" }}>
                                                    {category.description || "No description"}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                                                    style={
                                                        category.is_active
                                                            ? { background: "#f0fdf4", color: "#166534" }
                                                            : { background: "#f3f4f6", color: "#6b7280" }
                                                    }
                                                >
                                                    {category.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-gray-50"
                                                        style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-red-50"
                                                        style={{ borderColor: "#d4c5b0", color: "#dc2626" }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="border-t px-5 py-4" style={{ borderColor: "#e8e0d5" }}>
                        <p className="text-xs" style={{ color: "#a48755" }}>
                            Showing {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div
                            className="flex items-center justify-between border-b px-6 py-5"
                            style={{ borderColor: "#e8e0d5" }}
                        >
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "#1b4332" }}>
                                    {editingCategory ? "Edit Category" : "Add Category"}
                                </h2>
                                <p className="mt-0.5 text-xs" style={{ color: "#493d38" }}>
                                    {editingCategory ? "Update the category details." : "Create a new product category."}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-gray-100"
                                style={{ color: "#493d38" }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium" style={{ color: "#1b4332" }}>
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Necklaces, Rings, Earrings"
                                    className="w-full rounded-xl border px-4 py-3 text-sm transition"
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                                    onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium" style={{ color: "#1b4332" }}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Short category description"
                                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm transition"
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                                    onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="mb-2 block text-sm font-medium" style={{ color: "#1b4332" }}>
                                    Category Image
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border px-3 py-2.5 text-sm"
                                    style={{ borderColor: "#d4c5b0", color: "#493d38" }}
                                />
                                {form.image && (
                                    <p className="mt-2 text-xs" style={{ color: "#a48755" }}>
                                        Selected: {form.image.name}
                                    </p>
                                )}
                            </div>

                            {/* Active toggle */}
                            <label
                                className="flex cursor-pointer items-center justify-between rounded-xl border p-4"
                                style={{ borderColor: "#e8e0d5", background: "#faf9f6" }}
                            >
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "#1b4332" }}>Active</p>
                                    <p className="text-xs" style={{ color: "#493d38" }}>Show this category in the store.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    className="h-4 w-4"
                                />
                            </label>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
                                    style={{ borderColor: "#d4c5b0", color: "#493d38" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "#1b4332" }}
                                >
                                    {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
