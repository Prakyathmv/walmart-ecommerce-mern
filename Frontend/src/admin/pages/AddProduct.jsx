import React, { useState } from "react";
import "./AddProduct.css";

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



export default function AddProduct() {
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async () => {
    if (!productName || !brand || !category || !price) {
      alert("Please fill all fields");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", productName);
      formData.append("brand", brand);
      formData.append("category", category);
      formData.append("price", parseFloat(price) || 0);

      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("adminToken");

      const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        alert("Product added successfully");
        setProductName("");
        setBrand("");
        setCategory("");
        setPrice("");
        setImage(null);
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.log(error);
      alert("Error adding product");
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add Product</h2>

      <div>
        <label>Product Name</label>
        <br />
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Brand</label>
        <br />
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>

      <br />

      <div>
        <label>Category</label>
        <br />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <br />

      <div>
        <label>Price ($)</label>
        <br />
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>

      <br />

      <div>
        <label>Product Image</label>
        <br />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <br />

      <button onClick={handleSubmit}>Add Product</button>
    </div>
  );
}