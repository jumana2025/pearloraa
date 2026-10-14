import { useEffect, useState } from "react";
import { ArrowLeft, Upload, X, Trash2, CheckCircle, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ORIGIN } from "../../api/axios";

const API_URL = API_ORIGIN;

const inputStyle = {
    borderColor: "#d4c5b0",
    background: "#fff",
    color: "#1b4332",
    outline: "none",
};

function SectionCard({ title, children }) {
    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#e8e0d5" }}>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider" style={{ color: "#1b4332", letterSpacing: "0.12em" }}>
                {title}
            </h2>
            {children}
        </div>
    );
}

function Label({ children, required }) {
    return (
        <label className="mb-2 block text-sm font-medium" style={{ color: "#1b4332" }}>
            {children} {required && <span className="text-red-500">*</span>}
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className="w-full rounded-xl border px-4 py-3 text-sm transition"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
            onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
        />
    );
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [product, setProduct] = useState(null);

    const [form, setForm] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        discount_price: "",
        stock: "",
        is_active: true,
        is_featured: false,
    });

    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("admin_access");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [productRes, categoryRes] = await Promise.all([
                    fetch(`${API_URL}/api/products/admin/products/${id}/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_URL}/api/products/admin/categories/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!productRes.ok) throw new Error("Failed to load product");

                const productData = await productRes.json();
                const categoryData = categoryRes.ok ? await categoryRes.json() : { results: [] };

                setProduct(productData);
                setCategories(categoryData.results || categoryData);

                const catId = productData.category?.id ?? productData.category ?? "";

                setForm({
                    name: productData.name || "",
                    category: String(catId),
                    description: productData.description || "",
                    price: productData.price || "",
                    discount_price: productData.discount_price || "",
                    stock: productData.stock || "",
                    is_active: productData.is_active ?? true,
                    is_featured: productData.is_featured ?? false,
                });
            } catch {
                setError("Unable to load product.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, token]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleMainImage = (e) => {
        const file = e.target.files?.[0];
        if (file) setMainImage(file);
    };

    const handleAdditionalImages = (e) => {
        const files = Array.from(e.target.files || []);
        setAdditionalImages((prev) => [...prev, ...files]);
    };

    const removeAdditionalImage = (index) => {
        setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    };

    const deleteExistingImage = async (imageId) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            const res = await fetch(`${API_URL}/api/products/admin/products/${id}/images/${imageId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProduct((prev) => ({
                    ...prev,
                    images: (prev.images || []).filter((img) => img.id !== imageId),
                }));
            }
        } catch {
            alert("Failed to delete image.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) { setError("Product name is required."); return; }
        if (!form.price) { setError("Product price is required."); return; }

        try {
            setSaving(true);

            const productData = new FormData();
            productData.append("name", form.name);
            productData.append("description", form.description);
            productData.append("price", form.price);
            productData.append("discount_price", form.discount_price);
            productData.append("stock", form.stock || 0);
            productData.append("is_active", form.is_active ? "true" : "false");
            productData.append("is_featured", form.is_featured ? "true" : "false");
            if (form.category) productData.append("category", form.category);
            if (mainImage) productData.append("main_image", mainImage);

            const res = await fetch(`${API_URL}/api/products/admin/products/${id}/`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: productData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || "Failed to update product.");
                return;
            }

            for (const image of additionalImages) {
                const imgData = new FormData();
                imgData.append("product", id);
                imgData.append("image", image);
                await fetch(`${API_URL}/api/products/admin/products/${id}/images/`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: imgData,
                });
            }

            navigate("/admin/products");
        } catch {
            setError("Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-2 text-sm" style={{ color: "#a48755" }}>
                    <RefreshCw size={18} className="animate-spin" />
                    Loading product...
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex items-center gap-4">
                <button
                    onClick={() => navigate("/admin/products")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border transition hover:bg-white"
                    style={{ borderColor: "#d4c5b0", color: "#1b4332" }}
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#a48755", letterSpacing: "0.18em" }}>
                        Catalogue
                    </p>
                    <h1 className="text-2xl font-semibold" style={{ color: "#1b4332" }}>
                        Edit Product
                    </h1>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left */}
                    <div className="space-y-6 lg:col-span-2">
                        <SectionCard title="Basic Information">
                            <div className="space-y-5">
                                <div>
                                    <Label required>Product Name</Label>
                                    <Input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border px-4 py-3 text-sm transition"
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                                        onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Product description"
                                        className="w-full resize-none rounded-xl border px-4 py-3 text-sm transition"
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = "#1b4332")}
                                        onBlur={(e) => (e.target.style.borderColor = "#d4c5b0")}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Pricing & Stock">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <div>
                                    <Label required>Price (₹)</Label>
                                    <Input type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
                                </div>
                                <div>
                                    <Label>Discount Price (₹)</Label>
                                    <Input type="number" name="discount_price" min="0" step="0.01" value={form.discount_price} onChange={handleChange} placeholder="Optional" />
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <Input type="number" name="stock" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Current Main Image */}
                        {product?.main_image && (
                            <SectionCard title="Current Main Image">
                                <img
                                    src={product.main_image}
                                    alt="Current main"
                                    className="h-40 w-40 rounded-xl object-cover border"
                                    style={{ borderColor: "#e8e0d5" }}
                                />
                                <p className="mt-2 text-xs" style={{ color: "#a48755" }}>
                                    Upload a new image below to replace this.
                                </p>
                            </SectionCard>
                        )}

                        <SectionCard title="Replace Main Image">
                            <label
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition hover:bg-gray-50"
                                style={{ borderColor: "#d4c5b0" }}
                            >
                                <Upload size={22} className="mb-2" style={{ color: "#a48755" }} />
                                <p className="text-sm font-medium" style={{ color: "#1b4332" }}>
                                    Click to upload new main image
                                </p>
                                <p className="mt-1 text-xs" style={{ color: "#a48755" }}>PNG, JPG or WEBP</p>
                                <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
                            </label>
                            {mainImage && (
                                <div className="mt-4 flex items-center gap-4 rounded-xl border p-3" style={{ borderColor: "#e8e0d5", background: "#faf9f6" }}>
                                    <img src={URL.createObjectURL(mainImage)} alt="New main" className="h-20 w-20 rounded-xl object-cover" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} style={{ color: "#166534" }} />
                                            <p className="text-sm font-medium" style={{ color: "#1b4332" }}>{mainImage.name}</p>
                                        </div>
                                        <p className="text-xs" style={{ color: "#a48755" }}>Will replace current main image</p>
                                    </div>
                                </div>
                            )}
                        </SectionCard>

                        {/* Existing Gallery */}
                        {product?.images?.length > 0 && (
                            <SectionCard title="Current Gallery">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {product.images.map((img) => (
                                        <div key={img.id} className="relative">
                                            <img
                                                src={img.image}
                                                alt=""
                                                className="h-28 w-full rounded-xl object-cover border"
                                                style={{ borderColor: "#e8e0d5" }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => deleteExistingImage(img.id)}
                                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        <SectionCard title="Add More Gallery Images">
                            <label
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition hover:bg-gray-50"
                                style={{ borderColor: "#d4c5b0" }}
                            >
                                <Upload size={22} className="mb-2" style={{ color: "#a48755" }} />
                                <p className="text-sm font-medium" style={{ color: "#1b4332" }}>Add gallery images</p>
                                <p className="mt-1 text-xs" style={{ color: "#a48755" }}>Select multiple images</p>
                                <input type="file" accept="image/*" multiple onChange={handleAdditionalImages} className="hidden" />
                            </label>

                            {additionalImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {additionalImages.map((image, index) => (
                                        <div key={`${image.name}-${index}`} className="relative">
                                            <img src={URL.createObjectURL(image)} alt="" className="h-28 w-full rounded-xl object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeAdditionalImage(index)}
                                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                                            >
                                                <X size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Right */}
                    <div className="space-y-6">
                        <SectionCard title="Product Status">
                            <div className="space-y-4">
                                <label
                                    className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:bg-gray-50"
                                    style={{ borderColor: "#e8e0d5" }}
                                >
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "#1b4332" }}>Active</p>
                                        <p className="text-xs" style={{ color: "#493d38" }}>Show product in store</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 accent-[#1b4332]"
                                    />
                                </label>

                                <label
                                    className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:bg-gray-50"
                                    style={{ borderColor: "#e8e0d5" }}
                                >
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "#1b4332" }}>Featured</p>
                                        <p className="text-xs" style={{ color: "#493d38" }}>Show as featured product</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={form.is_featured}
                                        onChange={handleChange}
                                        className="h-4 w-4 accent-[#1b4332]"
                                    />
                                </label>
                            </div>
                        </SectionCard>

                        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#e8e0d5" }}>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ background: "#1b4332" }}
                            >
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/admin/products")}
                                className="mt-3 w-full rounded-xl border py-3.5 text-sm font-medium transition hover:bg-gray-50"
                                style={{ borderColor: "#d4c5b0", color: "#493d38" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
