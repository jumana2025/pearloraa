import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Package,
    RefreshCw,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

const inputBase = {
    borderColor: "#d4c5b0",
    background: "#fff",
    color: "#1b4332",
    outline: "none",
};

export default function Products() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const getToken = () => localStorage.getItem("admin_access");

    const fetchProducts = useCallback(async () => {
        const token = getToken();
        if (!token) { navigate("/admin/login"); return; }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_BASE_URL}/api/products/admin/products/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("admin_access");
                navigate("/admin/login");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch products");

            const data = await response.json();
            setProducts(Array.isArray(data) ? data : data.results || []);
        } catch {
            setError("Unable to load products.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const fetchCategories = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/admin/categories/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) return;
            const data = await response.json();
            setCategories(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Product categories fetch error:", error);
            setError("Unable to load product categories.");
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchProducts();
            void fetchCategories();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchCategories, fetchProducts]);

    const getCategoryName = useCallback((category) => {
        if (!category) return "Uncategorized";
        if (typeof category === "object") return category.name || "Uncategorized";
        const found = categories.find((c) => String(c.id) === String(category));
        return found?.name || "Uncategorized";
    }, [categories]);

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return products;
        return products.filter((p) => {
            const name = p.name?.toLowerCase() || "";
            const cat = getCategoryName(p.category).toLowerCase();
            return name.includes(keyword) || cat.includes(keyword);
        });
    }, [products, search, getCategoryName]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        const token = getToken();
        if (!token) { navigate("/admin/login"); return; }

        try {
            setDeletingId(productId);
            const response = await fetch(
                `${API_BASE_URL}/api/products/admin/products/${productId}/`,
                { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error();
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch {
            alert("Unable to delete product.");
        } finally {
            setDeletingId(null);
        }
    };

    const formatPrice = (price) => {
        const n = Number(price);
        return isNaN(n) ? "₹0.00" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    };

    const getProductImage = (product) => {
        if (product?.main_image) return product.main_image;
        if (Array.isArray(product?.images) && product.images.length > 0) return product.images[0]?.image || null;
        return null;
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#a48755", letterSpacing: "0.18em" }}>
                        Catalogue
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold" style={{ color: "#1b4332" }}>
                        Products
                    </h1>
                    <p className="mt-0.5 text-sm" style={{ color: "#493d38" }}>
                        Manage your Pearloraa jewellery catalogue
                    </p>
                </div>

                <button
                    onClick={() => navigate("/admin/products/add")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    style={{ background: "#1b4332" }}
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Search + count */}
            <div
                className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: "#e8e0d5" }}
            >
                <div className="relative w-full sm:max-w-sm">
                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#a48755" }}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products by name or category..."
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition"
                        style={inputBase}
                        onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                        onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: "#493d38" }}>
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                    </span>
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-50"
                        style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                style={{ borderColor: "#e8e0d5" }}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-sm" style={{ color: "#a48755" }}>
                        <RefreshCw size={18} className="mr-2 animate-spin" />
                        Loading products...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead style={{ background: "#faf9f6" }}>
                                <tr>
                                    {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                                            style={{ color: "#a48755", letterSpacing: "0.1em" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-20 text-center">
                                            <div
                                                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                                                style={{ background: "#f8f4ec" }}
                                            >
                                                <Package size={30} style={{ color: "#a48755" }} />
                                            </div>
                                            <h3 className="text-base font-semibold" style={{ color: "#1b4332" }}>
                                                {search ? "No products found" : "No products yet"}
                                            </h3>
                                            <p className="mt-1 text-sm" style={{ color: "#493d38" }}>
                                                {search ? "Try a different search term." : "Start by adding your first product."}
                                            </p>
                                            {!search && (
                                                <button
                                                    onClick={() => navigate("/admin/products/add")}
                                                    className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                                                    style={{ background: "#1b4332" }}
                                                >
                                                    <Plus size={16} />
                                                    Add First Product
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const image = getProductImage(product);
                                        return (
                                            <tr
                                                key={product.id}
                                                className="border-t transition hover:bg-[#fdfaf7]"
                                                style={{ borderColor: "#f0e8dc" }}
                                            >
                                                {/* Product */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border"
                                                            style={{ borderColor: "#e8e0d5" }}
                                                        >
                                                            {image ? (
                                                                <img
                                                                    src={image}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="flex h-full w-full items-center justify-center"
                                                                    style={{ background: "#f8f4ec" }}
                                                                >
                                                                    <Package size={20} style={{ color: "#a48755" }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs mt-0.5" style={{ color: "#a48755" }}>
                                                                ID #{product.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className="inline-flex rounded-lg px-2.5 py-1 text-xs font-medium"
                                                        style={{ background: "#f8f4ec", color: "#493d38" }}
                                                    >
                                                        {getCategoryName(product.category)}
                                                    </span>
                                                </td>

                                                {/* Price */}
                                                <td className="px-5 py-4">
                                                    {product.discount_price != null && product.discount_price !== "" ? (
                                                        <>
                                                            <p className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                                {formatPrice(product.discount_price)}
                                                            </p>
                                                            <p className="text-xs line-through" style={{ color: "#a48755" }}>
                                                                {formatPrice(product.price)}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm font-semibold" style={{ color: "#1b4332" }}>
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Stock */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color:
                                                                Number(product.stock) <= 0
                                                                    ? "#dc2626"
                                                                    : Number(product.stock) <= 5
                                                                    ? "#b45309"
                                                                    : "#1b4332",
                                                        }}
                                                    >
                                                        {product.stock}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span
                                                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                                                            style={
                                                                product.is_active
                                                                    ? { background: "#f0fdf4", color: "#166534" }
                                                                    : { background: "#f3f4f6", color: "#6b7280" }
                                                            }
                                                        >
                                                            {product.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                        {product.is_featured && (
                                                            <span
                                                                className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                                                                style={{ background: "#fef9ee", color: "#b45309" }}
                                                            >
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-gray-50"
                                                            style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                                                            title="Edit"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            disabled={deletingId === product.id}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-red-50 disabled:opacity-50"
                                                            style={{ borderColor: "#d4c5b0", color: "#dc2626" }}
                                                            title="Delete"
                                                        >
                                                            {deletingId === product.id ? (
                                                                <RefreshCw size={15} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={15} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredProducts.length > 0 && (
                    <div
                        className="border-t px-5 py-4"
                        style={{ borderColor: "#e8e0d5" }}
                    >
                        <p className="text-xs" style={{ color: "#a48755" }}>
                            Showing {filteredProducts.length} of {products.length} products
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
