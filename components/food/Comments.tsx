"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = {
  username: string;
  display_name: string;
  avatar: string | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: Profile | Profile[] | null;
};

type CommentsProps = {
  foodLogId: string;
};

export default function Comments({
  foodLogId,
}: CommentsProps) {
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [content, setContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/comments?foodLogId=${encodeURIComponent(
            foodLogId
          )}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load comments."
          );
        }

        if (!cancelled) {
          setComments(
            data.comments ?? []
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "COMMENTS LOAD ERROR:",
            error
          );

          setError(
            "Unable to load comments."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [foodLogId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        "/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            foodLogId,
            content:
              trimmedContent,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to add comment."
        );
      }

      setComments((current) => [
        ...current,
        data.comment,
      ]);

      setContent("");
    } catch (error) {
      console.error(
        "COMMENT SUBMIT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    commentId: string
  ) {
    try {
      const response = await fetch(
        `/api/comments?commentId=${encodeURIComponent(
          commentId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete comment."
        );
      }

      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !==
            commentId
        )
      );
    } catch (error) {
      console.error(
        "COMMENT DELETE ERROR:",
        error
      );

      setError(
        "Unable to delete comment."
      );
    }
  }

  return (
    <div className="mt-5 border-t border-neutral-100 pt-5">

      <h3 className="text-sm font-bold">
        Comments
      </h3>

      {/* Comments */}

      <div className="mt-4 space-y-4">

        {loading && (
          <p className="text-sm text-neutral-400">
            Loading comments...
          </p>
        )}

        {!loading &&
          comments.length === 0 && (
            <p className="text-sm text-neutral-400">
              No comments yet.
            </p>
          )}

        {comments.map((comment) => {
          const profile =
            Array.isArray(
              comment.profiles
            )
              ? comment.profiles[0]
              : comment.profiles;

          return (
            <div
              key={comment.id}
              className="flex gap-3"
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={
                    profile.display_name
                  }
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold">
                  {profile?.display_name
                    ?.charAt(0)
                    .toUpperCase() ??
                    "?"}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold">
                    {profile?.display_name ??
                      "User"}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        comment.id
                      )
                    }
                    className="text-xs text-neutral-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>

                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  {comment.content}
                </p>
              </div>
            </div>
          );
        })}

      </div>

      {/* Error */}

      {error && (
        <p className="mt-3 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Add comment */}

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex gap-2"
      >
        <input
          type="text"
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value
            )
          }
          maxLength={500}
          placeholder="Write a comment..."
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
        />

        <button
          type="submit"
          disabled={
            submitting ||
            !content.trim()
          }
          className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "..."
            : "Post"}
        </button>
      </form>

    </div>
  );
}