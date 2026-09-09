<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = \App\Models\User::all();
        $statuses = \App\Models\PostStatus::all();

        $posts = [
            ['title' => 'Getting Started with Laravel', 'body' => 'Laravel is a PHP framework for building web applications. It provides an elegant syntax and powerful tools for tasks like routing, authentication, and database management.'],
            ['title' => 'Understanding Sanctum', 'body' => 'Sanctum provides a simple approach to API token authentication. It supports both SPA authentication via cookies and mobile app authentication via API tokens.'],
            ['title' => 'Database Best Practices', 'body' => 'When designing your database, always use migrations to version control your schema. This allows your team to share and modify the database structure consistently.'],
        ];

        foreach ($posts as $index => $post) {
            \App\Models\Post::create([
                'title' => $post['title'],
                'body' => $post['body'],
                'user_id' => $users->random()->id,
                'post_status_id' => $statuses->where('name', 'published')->first()->id,
            ]);
        }
    }
}
