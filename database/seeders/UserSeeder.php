<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //admin user
        User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@livezen.test',
            'phone' => '0123456789',
            'address' => '123 Admin St, Admin City',
            'password' => Hash::make('12345678'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        //seller user
        User::create([
            'name' => 'Seller User',
            'username' => 'seller',
            'email' => 'seller@livezen.test',
            'phone' => '0787520742',
            'address' => '123 Seller St, Seller City',
            'password' => Hash::make('12345678'),
            'role' => 'seller',
            'email_verified_at' => now(),
        ]);

        //regular user
        User::create([
            'name' => 'Regular User',
            'username' => 'user',
            'email' => 'user@livezen.test',
            'phone' => '0723456189',
            'address' => '123 User St, User City',
            'password' => Hash::make('12345678'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);
    }
}
