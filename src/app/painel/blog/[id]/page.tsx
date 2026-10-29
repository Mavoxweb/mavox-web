"use client";

import { use } from "react";
import BlogPostForm from "@/components/blog/BlogPostForm";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BlogPostForm mode="edit" postId={id} />;
}
