"use client";

import {
  FormEvent,
  useState,
} from "react";

type CreateListFormProps = {
  onCreated?: () => void;
};

export default function CreateListForm({
  onCreated,
}: CreateListFormProps) {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [isPublic, setIsPublic] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "List name is required."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        "/api/lists",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            isPublic,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create list."
        );
      }

      setName("");
      setDescription("");
      setIsPublic(true);
      setSuccess(true);

      onCreated?.();
    } catch (error) {
      console.error(
        "CREATE LIST ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create list."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-neutral-200 bg-white p-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          New list
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
          Create a food list
        </h2>
      </div>

      {/* Name */}

      <div className="mt-6">
        <label
          htmlFor="list-name"
          className="text-sm font-semibold"
        >
          List name
        </label>

        <input
          id="list-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          maxLength={100}
          placeholder="Best biryani in Hyderabad"
          className="mt-2 h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-black"
        />
      </div>

      {/* Description */}

      <div className="mt-5">
        <label
          htmlFor="list-description"
          className="text-sm font-semibold"
        >
          Description
        </label>

        <textarea
          id="list-description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          maxLength={500}
          rows={4}
          placeholder="Places I want to try..."
          className="mt-2 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      {/* Visibility */}

      <label className="mt-5 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) =>
            setIsPublic(
              event.target.checked
            )
          }
          className="h-4 w-4"
        />

        <span className="text-sm">
          Make this list public
        </span>
      </label>

      {/* Error */}

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Success */}

      {success && (
        <p className="mt-4 text-sm text-green-600">
          List created successfully.
        </p>
      )}

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Creating..."
          : "Create list"}
      </button>
    </form>
  );
}