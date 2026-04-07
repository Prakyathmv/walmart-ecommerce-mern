import React, { useState, useEffect } from "react";
import "./ManageProducts.css";
import API_BASE from "../../utils/api";

const CATEGORIES = [
  "Grocery & Essentials",
  "Electronics",
  "Home & Garden",
  "Clothing & Apparel",
  "Sports & Outdoors",
  "Toys & Games",
  "Health & Wellness",
  "Baby & Toddler",
  "Automotive",
  "Beauty & Personal Care",
];

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          brand: editData.brand,
          category: editData.category,
          price: editData.price,
          stock: editData.stock,
          status: editData.status,
        })
      });
      const data = await response.json();
      if (data.success) {
        const updated = products.map((p) =>
          p.id === id ? data.data.product : p
        );
        setProducts(updated);
        setEditingId(null);
      } else {
        alert("Failed to save edit");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const updated = products.filter((p) => p.id !== id);
        setProducts(updated);
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="manage-products-container">
      <h2>Manage Products</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) =>
            editingId === product.id ? (
              <tr key={product.id}>
                <td>
                  {product.imageUrl ? (
                    <img
                      src={(product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)}
                      alt={product.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>
                  <input
                    value={editData.name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    value={editData.brand || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, brand: e.target.value })
                    }
                  />
                </td>

                <td>
                  <select
                    value={editData.category || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    type="number"
                    value={editData.price || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={editData.stock || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, stock: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    value={editData.status || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                  />
                </td>

                <td>
                  <button onClick={() => saveEdit(product.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={product.id}>
                <td>
                  {product.imageUrl ? (
                    <img
                      src={(product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)}
                      alt={product.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>{product.stock || "N/A"}</td>
                <td>{product.status || "Active"}</td>

                <td>
                  <button onClick={() => startEdit(product)}>Edit</button>
                  <button onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}