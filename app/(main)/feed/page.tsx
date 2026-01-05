"use client";

import { MessageCircle, Heart, Share2, Image as ImageIcon, Send, MoreHorizontal, User, Settings as SettingsIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Post {
    id: string;
    author: string;
    handle: string;
    time: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    avatar?: string;
    isLiked: boolean;
}

export default function CommunityPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [commentingOnPost, setCommentingOnPost] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState("");
    const [trendingTopics, setTrendingTopics] = useState<{ tag: string, count: number }[]>([]);
    const [userBio, setUserBio] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [postComments, setPostComments] = useState<Record<string, any[]>>({});

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch("/api/posts");
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTrendingTopics = useCallback(async () => {
        try {
            const res = await fetch("/api/trending");
            if (res.ok) {
                const data = await res.json();
                setTrendingTopics(data);
            }
        } catch (error) {
            console.error("Failed to fetch trending:", error);
        }
    }, []);

    const fetchUserBio = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const res = await fetch(`/api/users/${session.user.id}`);
            if (res.ok) {
                const data = await res.json();
                setUserBio(data.bio || "Passionate about sustainable agriculture. 🌾");
            }
        } catch (error) {
            console.error("Failed to fetch user bio:", error);
            setUserBio("Passionate about sustainable agriculture. 🌾");
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchPosts();
        fetchTrendingTopics();
        fetchUserBio();
    }, [fetchPosts, fetchTrendingTopics, fetchUserBio]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async () => {
        if (!session) {
            toast.error("Please login to post");
            return;
        }
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            let imageUrl = null;

            // Upload image if selected
            if (selectedImage) {
                const formData = new FormData();
                formData.append('file', selectedImage);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.url;
                }
            }

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newPostContent,
                    image: imageUrl
                })
            });

            if (res.ok) {
                setNewPostContent("");
                setSelectedImage(null);
                setImagePreview(null);
                fetchPosts();
                toast.success("Post created!");
            } else {
                toast.error("Failed to create post");
            }
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("Something went wrong");
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!session) return;

        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                    isLiked: !p.isLiked
                };
            }
            return p;
        }));

        try {
            await fetch(`/api/posts/${postId}/like`, { method: "POST" });
        } catch (error) {
            console.error("Error liking post:", error);
            // Revert on error would go here
        }
    };

    const handlePostComment = async () => {
        if (!session || !commentingOnPost || !commentContent.trim()) return;

        setIsPostingComment(true);
        try {
            const res = await fetch(`/api/posts/${commentingOnPost}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentContent })
            });

            if (res.ok) {
                // Refresh comments for this post
                await fetchCommentsForPost(commentingOnPost);
                setCommentContent('');
                setCommentingOnPost(null); // Close modal
                toast.success('Comment posted!');

                // Update comment count in posts
                setPosts(prev => prev.map(p =>
                    p.id === commentingOnPost ? { ...p, comments: p.comments + 1 } : p
                ));
            } else {
                toast.error('Failed to post comment');
            }
        } catch (error) {
            toast.error('Error posting comment');
        } finally {
            setIsPostingComment(false);
        }
    };

    const fetchCommentsForPost = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/comment`);
            if (res.ok) {
                const data = await res.json();
                setPostComments(prev => ({ ...prev, [postId]: data }));
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const openCommentModal = async (postId: string) => {
        setCommentingOnPost(postId);
        if (!postComments[postId]) {
            await fetchCommentsForPost(postId);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar - Profile & Nav */}
                <div className="hidden lg:block lg:col-span-3">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden sticky top-24">
                        <div className="h-28 bg-gradient-to-r from-primary to-green-600 relative">
                            <Link href="/settings" className="absolute top-2 right-2 bg-black/20 hover:bg-black/30 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer" title="Edit Profile">
                                <SettingsIcon className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="relative -mt-12 mb-3">
                                <div className="h-24 w-24 rounded-full border-4 border-white dark:border-surface-dark bg-white dark:bg-gray-800 overflow-hidden shadow-sm relative">
                                    {session?.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {session?.user?.name?.[0] || "U"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-text-light dark:text-text-dark">{session?.user?.name || "Guest User"}</h3>
                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark">@{session?.user?.email?.split('@')[0] || "guest"}</p>

                                {session ? (
                                    <p className="mt-3 text-sm text-text-light dark:text-text-dark">{userBio}</p>
                                ) : (
                                    <p className="mt-3 text-sm text-text-light dark:text-text-dark italic">Login to view full profile</p>
                                )}

                                <div className="mt-4 flex justify-between text-sm text-center border-t border-border-light dark:border-border-dark pt-4">
                                    <div className="flex-1">
                                        <span className="block font-bold text-text-light dark:text-text-dark">0</span>
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark text-xs">Following</span>
                                    </div>
                                    <div className="w-px bg-border-light dark:border-border-dark my-1"></div>
                                    <div className="flex-1">
                                        <span className="block font-bold text-text-light dark:text-text-dark">0</span>
                                        <span className="text-secondary-text-light dark:text-secondary-text-dark text-xs">Followers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-6 space-y-6">
                    {/* Create Post */}
                    {session && (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                                    {session.user?.image ? (
                                        <Image src={session.user.image} alt="User" fill className="object-cover" />
                                    ) : (
                                        <User className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        placeholder="Share your farming journey..."
                                        rows={2}
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-text-light dark:text-text-dark placeholder-gray-400 resize-none text-base"
                                    ></textarea>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border-light dark:border-border-dark">
                                        <div className="flex gap-2">
                                            <label className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-primary transition-colors cursor-pointer">
                                                <ImageIcon className="h-5 w-5" />
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                            </label>
                                            {imagePreview && (
                                                <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="text-xs text-red-500">Remove image</button>
                                            )}
                                        </div>
                                        {imagePreview && (
                                            <div className="mt-2 relative w-32 h-32 border rounded">
                                                <Image src={imagePreview} alt="Preview" fill className="object-cover rounded" />
                                            </div>
                                        )}
                                        <button
                                            onClick={handleCreatePost}
                                            disabled={!newPostContent.trim() || isPosting}
                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isPosting ? "Posting..." : "Post"} <Send className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts Feed */}
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No posts yet. Be the first to share!
                            </div>
                        ) : (
                            posts.map((post) => (
                                <article key={post.id} className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                                    <div className="p-4 flex gap-3">
                                        <div className="h-10 w-10 rounded-full flex-shrink-0 relative overflow-hidden bg-gray-200">
                                            {post.avatar ? (
                                                <Image src={post.avatar} alt={post.author} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-primary text-white font-bold text-xs">
                                                    {post.author[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-text-light dark:text-text-dark hover:underline cursor-pointer">{post.author}</h4>
                                                    <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark">{post.handle} • {post.time}</p>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <p className="mt-2 text-text-light dark:text-text-dark whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                    </div>

                                    {post.image && (
                                        <div className="w-full h-64 sm:h-80 bg-gray-100 dark:bg-gray-800 relative">
                                            <Image
                                                src={post.image}
                                                alt="Post content"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 600px"
                                            />
                                        </div>
                                    )}

                                    <div className="px-4 py-3 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className={cn(
                                                "flex items-center gap-2 transition-colors",
                                                post.isLiked ? "text-red-500" : "text-secondary-text-light dark:text-secondary-text-dark hover:text-red-500"
                                            )}
                                        >
                                            <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
                                            <span className="text-sm font-medium">{post.likes}</span>
                                        </button>
                                        <button onClick={() => openCommentModal(post.id)} className="flex items-center gap-2 text-secondary-text-light dark:text-secondary-text-dark hover:text-primary transition-colors">
                                            <MessageCircle className="h-5 w-5" />
                                            <span className="text-sm font-medium">{post.comments}</span>
                                        </button>
                                        <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!'); }} className="flex items-center gap-2 text-secondary-text-light dark:text-secondary-text-dark hover:text-primary transition-colors">
                                            <Share2 className="h-5 w-5" />
                                            <span className="text-sm font-medium">Share</span>
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Trending */}
                <div className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-4">
                            <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4">Trending Topics</h3>
                            <ul className="space-y-4">
                                {trendingTopics.length > 0 ? (
                                    trendingTopics.slice(0, 5).map((topic, i) => (
                                        <li key={i}>
                                            <Link href={`/feed?tag=${encodeURIComponent(topic.tag)}`} className="block group">
                                                <span className="text-sm font-medium text-text-light dark:text-text-dark group-hover:text-primary transition-colors">{topic.tag}</span>
                                                <span className="text-xs text-gray-500 ml-2">({topic.count} posts)</span>
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No trending topics yet</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comment Modal */}
            {commentingOnPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCommentingOnPost(null)}>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">Comments</h3>
                            <button onClick={() => setCommentingOnPost(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-96 p-4">
                            {postComments[commentingOnPost]?.length > 0 ? (
                                <div className="space-y-4">
                                    {postComments[commentingOnPost].map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-medium text-text-light dark:text-text-dark">{comment.author || 'Anonymous'}</p>
                                                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No comments yet. Be the first!</p>
                            )}
                        </div>

                        {session && (
                            <div className="p-4 border-t border-border-light dark:border-border-dark">
                                <textarea
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={3}
                                    className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-text-light dark:text-text-dark resize-none"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!commentContent.trim() || isPostingComment}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                                    >
                                        {isPostingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
