<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller implements HasMiddleware
{
    public static function middleware() {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show'])
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Post::with(['user', 'postStatus'])->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'title' => 'required|max:255',
            'body' => 'required'
        ]);

        // Default to 'draft' status
        $draftStatus = \App\Models\PostStatus::where('name', 'draft')->first();
        $fields['post_status_id'] = $draftStatus ? $draftStatus->id : null;

        $post = $request->user()->posts()->create($fields);

        return response()->json($post, 201);
    }

    /**
     * Update the status of the post.
     */
    public function updateStatus(Request $request, Post $post)
    {
        Gate::authorize('modify', $post);

        $fields = $request->validate([
            'status' => 'required|exists:post_statuses,name'
        ]);

        $status = \App\Models\PostStatus::where('name', $fields['status'])->first();
        $post->update(['post_status_id' => $status->id]);

        return $post->load('postStatus');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return $post->load(['user', 'postStatus']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        Gate::authorize('modify', $post);
        $fields = $request->validate([
            'title' => 'required|max:255',
            'body' => 'required'
        ]);

        $post->update($fields);

        return $post;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        Gate::authorize('modify', $post);
        $post->delete();
        return ['message' => "The post ($post->id) has been deleted"];
    }
}
