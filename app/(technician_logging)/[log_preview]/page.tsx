"use client";
//misappropriated from https://nextjs.org/docs/app/getting-started/layouts-and-pages
export default async function PreviewLog({
  params,
}: {
  params: Promise<{ log_preview: string }>;
}) {
  const { log_preview } = await params;
  //const post = await print(slug)

  return (
    <div>
      <h1>{"post.title"}</h1>
      <p>{"post.content"}</p>
    </div>
  );
}
