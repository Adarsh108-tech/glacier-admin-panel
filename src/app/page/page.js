"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";

const BlogManager = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

      setTitle("");
      setDescription("");
      setMedia(null);
      setPreview(null);
      setUploadProgress(0);
      setLoading(false);

      fetchBlogs();
      alert("Blog uploaded successfully!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to upload blog");
    }
  };

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
    <div className="p-6 w-[100vw] mx-auto bg-glacier-light rounded-lg shadow-lg text-white">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 text-center text-glacier-dark">
        Create a Blog
      </h2>

      {/* Form */}
      <form className="flex flex-col gap-4 mb-10" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          className="border whitespace-pre-wrap border-glacier-soft p-3 rounded-lg bg-glacier-light text-glacier-dark placeholder-glacier-dark focus:outline-none focus:ring-2 focus:ring-glacier-primary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="border whitespace-pre-wrap border-glacier-soft p-3 rounded-lg bg-glacier-light text-glacier-dark placeholder-glacier-dark focus:outline-none focus:ring-2 focus:ring-glacier-primary"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="text-glacier-dark"
        />

        {/* Preview */}
        {preview && media && (
          <div className="mb-2 flex justify-center">
            {media.type.startsWith("image") ? (
              <img src={preview} alt="preview" className="w-64 rounded-lg border border-glacier-soft" />
            ) : (
              <video src={preview} controls className="w-64 rounded-lg border border-glacier-soft"></video>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {loading && (
          <div className="w-full bg-glacier-light rounded-full h-2 mb-2">
            <div
              className="bg-glacier-primary h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          type="submit"
          className="bg-glacier-primary  text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Blog"}
        </button>
      </form>

      {/* All Blogs */}
      <h2 className="text-3xl font-bold mb-6  text-center">
        All Blogs
      </h2>
      {blogs.length === 0 && <p className="text-center text-glacier-soft">No blogs available.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id} className="border border-glacier-soft p-4 rounded-lg relative bg-glacier-light text-glacier-dark shadow-md hover:shadow-xl transition-shadow">
            <button
              className="absolute top-2 right-2 text-glacier-accent hover:text-red-600"
              onClick={() => handleDelete(blog._id)}
            >
              <FiTrash2 size={20} />
            </button>
            <h3 className="font-bold text-xl mb-2">{blog.title}</h3>
            <p className="mb-2 whitespace-pre-wrap">{blog.description}</p>
            {blog.mediaType === "image" ? (
              <img src={blog.mediaUrl} alt={blog.title} className="w-full rounded-lg" />
            ) : (
              <video src={blog.mediaUrl} controls className="w-full rounded-lg"></video>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;
