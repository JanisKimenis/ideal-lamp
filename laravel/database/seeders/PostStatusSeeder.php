<?php

namespace Database\Seeders;

use App\Models\PostStatus;
use Illuminate\Database\Seeder;

class PostStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'published', 'description' => 'Visible to everyone.'],
            ['name' => 'draft', 'description' => 'Work in progress.'],
            ['name' => 'scheduled', 'description' => 'Will be published at a later date.'],
            ['name' => 'review', 'description' => 'Waiting for approval.'],
            ['name' => 'archived', 'description' => 'Hidden but preserved.'],
            ['name' => 'deleted', 'description' => 'Marked for deletion.'],
        ];

        foreach ($statuses as $status) {
            PostStatus::updateOrCreate(['name' => $status['name']], $status);
        }
    }
}
