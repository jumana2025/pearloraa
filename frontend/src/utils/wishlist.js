const API_URL = "http://127.0.0.1:8000";

function getAccessToken() {
    return (
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")
    );
}

async function wishlistRequest(path, token, options = {}) {
    const response = await fetch(`${API_URL}/api/wishlist/${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to update your wishlist.");
    }

    return response.json();
}

function notifyWishlistUpdated() {
    window.dispatchEvent(new Event("wishlistUpdated"));
}

export async function loadWishlistItems() {
    const token = getAccessToken();
    if (!token) {
        localStorage.removeItem("pearloraa_wishlist");
        return [];
    }

    localStorage.removeItem("pearloraa_wishlist");
    const data = await wishlistRequest("", token);
    return Array.isArray(data.items) ? data.items : [];
}

export async function toggleWishlistProduct(productId, shouldSave) {
    const token = getAccessToken();
    if (!token) {
        throw new Error("Please sign in to update your wishlist.");
    }

    const items = await loadWishlistItems();
    const item = items.find(
        (savedItem) => Number(savedItem.product?.id) === Number(productId)
    );

    if (shouldSave && !item) {
        await wishlistRequest("add/", token, {
            method: "POST",
            body: JSON.stringify({ product_id: Number(productId) }),
        });
    } else if (!shouldSave && item) {
        await wishlistRequest(`items/${item.id}/remove/`, token, {
            method: "DELETE",
        });
    }

    const updatedItems = await wishlistRequest("", token);
    const result = Array.isArray(updatedItems.items)
        ? updatedItems.items
        : [];
    notifyWishlistUpdated();
    return result;
}
