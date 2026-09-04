<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\PostStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_user_succeeds()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
        
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_login_user_succeeds()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password', // Casts to hashed in User model
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_index_posts_succeeds()
    {
        $response = $this->getJson('/api/posts');

        $response->assertStatus(200);
    }

    public function test_store_post_succeeds()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/posts', [
                'title' => 'Test Title',
                'body' => 'Test Body',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('posts', [
            'title' => 'Test Title',
            'user_id' => $user->id
        ]);
    }

    public function test_update_post_succeeds()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'Old Title',
            'body' => 'Old Body',
            'user_id' => $user->id
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/posts/{$post->id}", [
                'title' => 'New Title',
                'body' => 'New Body',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'New Title',
        ]);
    }

    public function test_delete_post_succeeds()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'To Delete',
            'body' => 'Body',
            'user_id' => $user->id
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
    }

    public function test_api_returns_json_even_without_accept_header()
    {
        // Using regular 'get' instead of 'getJson'
        $response = $this->get('/api/posts');

        $response->assertHeader('Content-Type', 'application/json');
    }

    public function test_unauthenticated_api_request_returns_json_error()
    {
        // Protected route
        $response = $this->get('/api/user');

        $response->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_index_comments_succeeds()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'title' => 'Test',
            'body' => 'Body',
            'user_id' => $user->id
        ]);
        Comment::create([
            'content' => 'A comment',
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $response = $this->getJson("/api/posts/{$post->id}/comments");

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJson([['content' => 'A comment']]);
    }

    public function test_store_comment_succeeds()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'Test',
            'body' => 'Body',
            'user_id' => $user->id
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/posts/{$post->id}/comments", [
                'content' => 'My comment',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('comments', [
            'content' => 'My comment',
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    public function test_unauthorized_comment_store_fails()
    {
        $user = User::factory()->create();
        $post = Post::create([
            'title' => 'Test',
            'body' => 'Body',
            'user_id' => $user->id
        ]);

        $response = $this->postJson("/api/posts/{$post->id}/comments", [
            'content' => 'No auth',
        ]);

        $response->assertStatus(401);
    }

    public function test_update_comment_succeeds()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'Test',
            'body' => 'Body',
            'user_id' => $user->id
        ]);
        $comment = Comment::create([
            'content' => 'Original',
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/posts/{$post->id}/comments/{$comment->id}", [
                'content' => 'Updated',
            ]);

        $response->assertStatus(200)
            ->assertJson(['content' => 'Updated']);
    }

    public function test_delete_comment_succeeds()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'Test',
            'body' => 'Body',
            'user_id' => $user->id
        ]);
        $comment = Comment::create([
            'content' => 'Delete me',
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/posts/{$post->id}/comments/{$comment->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_update_post_status_succeeds()
    {
        $status = PostStatus::create(['name' => 'draft', 'description' => 'Draft']);
        PostStatus::create(['name' => 'published', 'description' => 'Published']);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'Test',
            'body' => 'Body',
            'user_id' => $user->id,
            'post_status_id' => $status->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/posts/{$post->id}/status", [
                'status' => 'published',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'post_status_id' => 2,
        ]);
    }

    public function test_cannot_update_others_post()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $otherToken = $other->createToken('test')->plainTextToken;
        $post = Post::create([
            'title' => 'Owned',
            'body' => 'Body',
            'user_id' => $owner->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $otherToken)
            ->putJson("/api/posts/{$post->id}", [
                'title' => 'Hacked',
                'body' => 'Body',
            ]);

        $response->assertStatus(403);
    }
}
