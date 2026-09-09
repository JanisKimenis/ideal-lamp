<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CommentController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show'])
        ];
    }

    public function index(Post $post)
    {
        return $post->comments()->with('user')->get();
    }

    public function store(Request $request, Post $post)
    {
        $fields = $request->validate([
            'content' => 'required|string'
        ]);

        $comment = $post->comments()->create([
            'content' => $fields['content'],
            'user_id' => $request->user()->id
        ]);

        return response()->json($comment, 201);
    }

    public function show(Post $post, Comment $comment)
    {
        return $comment;
    }

    public function update(Request $request, Post $post, Comment $comment)
    {
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $fields = $request->validate([
            'content' => 'required|string'
        ]);

        $comment->update($fields);

        return $comment;
    }

    public function destroy(Request $request, Post $post, Comment $comment)
    {
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
