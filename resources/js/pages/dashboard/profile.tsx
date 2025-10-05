import Footer from '@/components/footer';
import NavStore from '@/components/nav-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Mail,
    MapPin,
    Phone,
    Shield,
    User,
} from 'lucide-react';
import { FormEvent } from 'react';
import { toast } from 'sonner';

type User = {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
};

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

export default function Profile() {
    const { props } = usePage<PageProps>();
    const { auth } = props;

    const { data, setData, put, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put('/dashboard/profile', {
            onSuccess: () => {
                toast.success('Profile updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update profile');
            },
        });
    };

    return (
        <>
            <Head title="Profile" />
            <div className="min-h-screen bg-gray-50">
                <NavStore />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Profile Settings
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Manage your account information and preferences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Profile Overview */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Account Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                                            <span className="text-2xl font-bold text-white">
                                                {auth.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold">
                                            {auth.user.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {auth.user.email}
                                        </p>
                                    </div>

                                    <div className="space-y-3 border-t pt-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                Member since
                                            </span>
                                            <span className="font-medium">
                                                {new Date(
                                                    auth.user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm">
                                            <Shield className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                Email status
                                            </span>
                                            <span
                                                className={`font-medium ${auth.user.email_verified_at ? 'text-green-600' : 'text-yellow-600'}`}
                                            >
                                                {auth.user.email_verified_at
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profile Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Full Name
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="pl-10"
                                                        required
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="text-sm text-red-600">
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="pl-10"
                                                        required
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-sm text-red-600">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Phone Number
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="Enter phone number"
                                                        className="pl-10"
                                                        disabled
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Phone number feature coming
                                                    soon
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="location">
                                                    Location
                                                </Label>
                                                <div className="relative">
                                                    <MapPin className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="location"
                                                        type="text"
                                                        placeholder="Enter location"
                                                        className="pl-10"
                                                        disabled
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Location feature coming soon
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Updating...'
                                                    : 'Update Profile'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Security Settings */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <h4 className="font-medium">
                                                Password
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Change your account password
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Change Password
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <h4 className="font-medium">
                                                Two-Factor Authentication
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Add an extra layer of security
                                                to your account
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Enable 2FA
                                        </Button>
                                    </div>

                                    {!auth.user.email_verified_at && (
                                        <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                            <div>
                                                <h4 className="font-medium text-yellow-800">
                                                    Email Verification
                                                </h4>
                                                <p className="text-sm text-yellow-700">
                                                    Please verify your email
                                                    address
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Send Verification
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
