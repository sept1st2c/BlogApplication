import { Blogcard } from "../components/BlogCard";

export const Blogs = () => {
  return (
    <div>
      {/* <Appbar /> */}
      <div className="flex justify-center">
        <div>
          {blogs.map((blog) => (
            <Blogcard
              id={blog.id}
              authorName={blog.author.name || "Anonymous"}
              title={blog.title}
              content={blog.content}
              publishedDate={"2nd Feb 2024"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
