"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";

const BlogManager = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null); // For preview before upload
  const [blogs, setBlogs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL; // replace with your backend URL

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${backendURL}/getBlog`);
      setBlogs(res.data.blogs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Preview selected file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Handle blog submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !media) return alert("All fields are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("media", media);

    try {
      setLoading(true);
      await axios.post(`${backendURL}/storeBlog`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      // Reset form
      setTitle("");
      setDescription("");
      setMedia(null);
      setPreview(null);
      setUploadProgress(0);
      setLoading(false);

      fetchBlogs(); // refresh blog list
      alert("Blog uploaded successfully!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to upload blog");
    }
  };

  // Handle blog deletion
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`${backendURL}/deleteBlog/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-black">
      <h2 className="text-2xl font-bold mb-4 text-white">Create a Blog</h2>
      <form className="flex flex-col gap-4 mb-8" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />

        {/* Preview */}
        {preview && media && (
          <div className="mb-2">
            {media.type.startsWith("image") ? (
              <img src={preview} alt="preview" className="w-64 rounded" />
            ) : (
              <video src={preview} controls className="w-64 rounded"></video>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {loading && (
          <div className="w-full bg-gray-200 rounded h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Blog"}
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4 text-white">All Blogs</h2>
      {blogs.length === 0 && <p className="text-white">No blogs available.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id} className="border p-4 rounded relative bg-white">
            <button
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              onClick={() => handleDelete(blog._id)}
            >
              <FiTrash2 size={20} />
            </button>
            <h3 className="font-bold text-lg mb-2">{blog.title}</h3>
            <p className="mb-2">{blog.description}</p>
            {blog.mediaType === "image" ? (
              <img src={blog.mediaUrl} alt={blog.title} className="w-full rounded" />
            ) : (
              <video src={blog.mediaUrl} controls className="w-full rounded"></video>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;
