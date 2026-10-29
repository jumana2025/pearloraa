import { useEffect, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { API_ORIGIN } from "../../api/axios";

const imageFields = [
    { key: "hero_image", title: "Homepage hero", description: "The main banner at the top of the home page." },
    { key: "editorial_image", title: "Editorial section", description: "The large image beside the Pearloraa story." },
    { key: "gifting_image", title: "Gifting section", description: "The image beside the gifting message." },
];

function imageUrl(value) {
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}

export default function HomeImages() {
    const [settings, setSettings] = useState({});
    const [files, setFiles] = useState({});
    const [previews, setPreviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchSettings = async () => {
        const token = localStorage.getItem("admin_access");
        const response = await fetch(`${API_ORIGIN}/api/products/admin/homepage/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Could not load homepage images.");
        setSettings(await response.json());
    };

    useEffect(() => {
        let active = true;
        fetchSettings()
            .catch((loadError) => active && setError(loadError.message))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    useEffect(() => () => {
        Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    }, [previews]);

    const handleSave = async (event) => {
        event.preventDefault();
        if (!Object.keys(files).length) {
            setError("Choose at least one image to update.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const data = new FormData();
            Object.entries(files).forEach(([field, file]) => data.append(field, file));
            const token = localStorage.getItem("admin_access");
            const response = await fetch(`${API_ORIGIN}/api/products/admin/homepage/`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.detail || "Could not save homepage images.");
            setSettings(result);
            setFiles({});
            setPreviews({});
            setSuccess("Homepage images saved.");
        } catch (saveError) {
            setError(saveError.message || "Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-7">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a48755]">Storefront</p>
                <h1 className="mt-1 text-2xl font-semibold text-[#1b4332]">Home page images</h1>
                <p className="mt-2 text-sm text-[#493d38]">Replace each home page image independently. Product and category images are managed in their own sections.</p>
            </div>

            {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

            {loading ? (
                <div className="rounded-2xl border border-[#e8e0d5] bg-white p-8 text-sm text-[#a48755]">Loading homepage images…</div>
            ) : (
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {imageFields.map((field) => {
                            const selected = files[field.key];
                            const preview = previews[field.key] || imageUrl(settings[field.key]);
                            return (
                                <section key={field.key} className="overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white shadow-sm">
                                    <div className="aspect-[4/3] bg-[#f8f4ec]">
                                        {preview ? (
                                            <img src={preview} alt={`${field.title} preview`} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a48755]"><ImagePlus size={28} /><span className="text-xs">No image selected</span></div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h2 className="font-semibold text-[#1b4332]">{field.title}</h2>
                                        <p className="mt-1 min-h-10 text-xs leading-5 text-[#493d38]">{field.description}</p>
                                        <label className="mt-4 block text-xs font-medium text-[#1b4332]">
                                            Choose replacement image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0];
                                                    if (!file) return;
                                                    setFiles((current) => ({ ...current, [field.key]: file }));
                                                    setPreviews((current) => ({ ...current, [field.key]: URL.createObjectURL(file) }));
                                                }}
                                                className="mt-2 block w-full text-xs text-[#493d38] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1b4332] file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
                                            />
                                        </label>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#123324] disabled:opacity-60 sm:w-auto">
                            <Save size={16} />{saving ? "Saving…" : "Save selected images"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
