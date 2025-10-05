<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seller = User::where('role', 'seller')->inRandomOrder()->first();
        $category = Category::inRandomOrder()->first();

        return [
            'seller_id' => $seller?->id ?? 1,
            'category_id' => $category?->id,
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(10),
            'price' => $this->faker->randomFloat(2, 500, 50000),
            'image' => 'https://via.placeholder.com/300',
            'stock' => $this->faker->numberBetween(0, 100),
            'status' => $this->faker->randomElement(['Active', 'Low Stock', 'Out of Stock']),
        ];
    }
}
