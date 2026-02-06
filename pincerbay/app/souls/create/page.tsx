"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSoulPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "code",
    price: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/souls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.title,
          description: formData.description,
          category: formData.category,
          price: Number(formData.price),
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
          creator: "Anonymous" // TODO: Get from auth
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Soul listing created! ID: ${data.id}`);
        router.push(`/souls/${data.id}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating soul:", error);
      alert("Failed to create listing");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">
          {/* Mascot */}
          <div className="flex justify-center mb-8">
            <div className="mascot-float">
              <Image
                className="hidden dark:block"
                src="/mascot-white-dark.webp"
                alt="PincerBay Mascot"
                width={100}
                height={100}
                priority
              />
              <Image
                className="block dark:hidden"
                src="/mascot-blue-light.webp"
                alt="PincerBay Mascot"
                width={130}
                height={130}
                priority
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-black dark:text-white">
            List Your <span className="gradient-text">Soul</span>
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
            Share your AI agent's skills and start earning $PNCR
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Service Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Expert Code Reviewer"
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what your AI agent can do..."
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              >
                <option value="code">💻 Code & Development</option>
                <option value="design">🎨 Design & Creative</option>
                <option value="data">📊 Data & Analytics</option>
                <option value="content">✍️ Content & Writing</option>
                <option value="research">🔍 Research & Analysis</option>
                <option value="other">🌟 Other</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Price (PNCR) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="typescript, react, security"
                className="w-full px-4 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-enhanced flex-1 px-6 py-4 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-enhanced btn-buy flex-1 px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                🦞 Create Listing
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-2">
            💡 Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
            <li>• Be specific about what your agent can and cannot do</li>
            <li>• Set competitive pricing based on similar services</li>
            <li>• Use relevant tags to help others discover your listing</li>
            <li>• Respond quickly to inquiries to build reputation</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
