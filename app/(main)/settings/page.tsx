"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Camera, Save } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProfileSettingsPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        location: "",
        avatar: "",
        age: "",
        gender: "Prefer not to say"
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();

                    // Split name if first/last not explicitly set
                    let firstName = data.firstName || "";
                    let lastName = data.lastName || "";

                    if (!firstName && data.name) {
                        const parts = data.name.split(" ");
                        firstName = parts[0];
                        lastName = parts.slice(1).join(" ");
                    }

                    setFormData({
                        firstName: firstName,
                        lastName: lastName,
                        email: data.email || "",
                        bio: data.bio || "",
                        location: data.location || "",
                        avatar: data.image || "", // Firestore stores as 'image'
                        age: data.age?.toString() || "",
                        gender: data.gender || "Prefer not to say"
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Show local preview immediately
            const localUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatar: localUrl }));

            // Upload to server
            setIsLoading(true);
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (uploadRes.ok) {
                    const { url } = await uploadRes.json();
                    setFormData(prev => ({ ...prev, avatar: url }));
                } else {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Failed to upload image');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    bio: formData.bio,
                    location: formData.location,
                    age: formData.age,
                    gender: formData.gender,
                    image: formData.avatar // Include profile picture URL
                }),
            });

            if (res.ok) {
                alert("Profile updated successfully!");
                // Ideally refresh session here too if name changed
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching && session) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }

    return (
        <div className="p-6 sm:p-8">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Edit Profile</h2>
                <p className="text-sm text-secondary-text-light dark:text-secondary-text-dark mt-1">
                    Update your personal information and public profile.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-800">
                            {formData.avatar ? (
                                <Image
                                    src={formData.avatar}
                                    alt="Profile"
                                    className="object-cover"
                                    fill
                                    sizes="96px"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-medium text-text-light dark:text-text-dark">Profile Photo</h3>
                        <p className="text-xs text-secondary-text-light dark:text-secondary-text-dark mt-1 mb-3">
                            Supports JPG, PNG or GIF. Max size 2MB.
                        </p>
                        <label htmlFor="avatar-upload" className="cursor-pointer inline-block text-sm font-medium text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                            Upload New
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            First name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="first-name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            Last name
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="last-name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="age" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            Age
                        </label>
                        <div className="mt-1">
                            <input
                                type="number"
                                id="age"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                min={18}
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="gender" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            Gender
                        </label>
                        <div className="mt-1">
                            <select
                                id="gender"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-gray-100 dark:bg-gray-800 px-4 py-2 text-gray-500 cursor-not-allowed sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            Bio
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="bio"
                                rows={3}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm resize-none"
                            />
                        </div>
                        <p className="mt-2 text-sm text-secondary-text-light dark:text-secondary-text-dark">
                            Brief description for your profile. URLs are hyperlinked.
                        </p>
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="location" className="block text-sm font-medium text-text-light dark:text-text-dark">
                            Location
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-2 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border-light dark:border-border-dark flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all"
                    >
                        {isLoading ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
