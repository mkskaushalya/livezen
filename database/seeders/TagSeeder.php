<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = ['New', 'Popular', 'Eco', 'Discount', 'Limited', 'Trending'];

        foreach ($tags as $name) {
            Tag::create([
                'name' => $name,
                'slug' => strtolower($name),
            ]);
        }
    }
}
