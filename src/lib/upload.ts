"use client";

import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 8 * 1024 * 1024;

/** Uploads images to the public "product-images" bucket under `folder/`. Returns their public URLs and any error. */
export async function uploadImages(files: FileList | File[], folder: string): Promise<{ urls: string[]; error: string | null }> {
  const supabase = createClient();
  const urls: string[] = [];
  let error: string | null = null;
  for (const file of Array.from(files)) {
    if (file.size > MAX_BYTES) {
      error = `${file.name} is larger than 8 MB.`;
      continue;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${slugify(folder || "upload")}/${crypto.randomUUID()}.${ext}`;
    const { error: e } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
    if (e) {
      error = e.message;
      continue;
    }
    urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
  }
  return { urls, error };
}
