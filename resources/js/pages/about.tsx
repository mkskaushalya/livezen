import NavStore from '@/components/nav-store';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ShieldCheckIcon, TruckIcon, RefreshCcwIcon, HeartIcon, UsersIcon, StarIcon } from 'lucide-react';

export default function About() {
    const features = [
        {
            name: 'Trusted Sellers',
            description: 'All our sellers are verified and trusted partners who meet our quality standards.',
            icon: ShieldCheckIcon,
        },
        {
            name: 'Fast Delivery',
            description: 'Get your orders delivered quickly with our reliable shipping network.',
            icon: TruckIcon,
        },
        {
            name: 'Easy Returns',
            description: 'Not satisfied? Return your purchase within 30 days for a full refund.',
            icon: RefreshCcwIcon,
        },
        {
            name: 'Customer First',
            description: 'We prioritize customer satisfaction above everything else.',
            icon: HeartIcon,
        },
        {
            name: 'Community Driven',
            description: 'Built by the community, for the community. Your feedback shapes our platform.',
            icon: UsersIcon,
        },
        {
            name: 'Quality Assured',
            description: 'Every product goes through our quality assurance process.',
            icon: StarIcon,
        },
    ];

    const stats = [
        { name: 'Happy Customers', value: '10,000+' },
        { name: 'Products Available', value: '50,000+' },
        { name: 'Trusted Sellers', value: '1,000+' },
        { name: 'Countries Served', value: '25+' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <NavStore />
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            About LiveZen
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-indigo-100">
                            We're building the future of e-commerce by connecting trusted sellers with customers worldwide. 
                            Our mission is to create a marketplace where quality, trust, and innovation come together.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Trusted by customers worldwide
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Join thousands of satisfied customers who trust LiveZen for their shopping needs.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.name} className="text-center">
                                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                                <dd className="order-first text-3xl font-bold tracking-tight text-indigo-600 sm:text-5xl">
                                    {stat.value}
                                </dd>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-600">Why Choose Us</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need for a great shopping experience
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We've built our platform with you in mind, focusing on quality, trust, and convenience.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature) => (
                                <div key={feature.name} className="flex flex-col items-center text-center">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
                                        <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                                    </div>
                                    <dt className="text-xl font-semibold leading-7 text-gray-900">
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600 text-center">
                                        {feature.description}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Story</h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            LiveZen was born from a simple idea: create a marketplace where trust and quality come first. 
                            We started as a small team of passionate individuals who believed that e-commerce could be better, 
                            more transparent, and more focused on building genuine relationships between buyers and sellers.
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Today, we're proud to be home to thousands of trusted sellers and millions of satisfied customers. 
                            Our platform continues to evolve, driven by feedback from our community and our commitment to 
                            providing the best possible shopping experience.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="flex flex-col lg:pb-6">
                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Our Mission</h3>
                            <p className="mt-6 text-base leading-7 text-gray-600">
                                To create the world's most trusted e-commerce platform where every transaction is built on 
                                transparency, quality, and mutual respect between buyers and sellers.
                            </p>
                        </div>
                        <div className="flex flex-col lg:pb-6">
                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Our Vision</h3>
                            <p className="mt-6 text-base leading-7 text-gray-600">
                                A world where online shopping is not just convenient, but also builds communities, 
                                supports local businesses, and contributes to a more sustainable future.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-indigo-600">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to start shopping?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
                            Join thousands of satisfied customers and discover amazing products from trusted sellers.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link href="/products">
                                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-50">
                                    Browse Products
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-indigo-600">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}