import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@sept1st2c/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

//

///

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  const user = await verify(authHeader, c.env.JWT_SECRET);

  if (user) {
    c.set("userId", user.id as string);
    await next();
  } else {
    return c.json({
      message: "not logged in",
    });
  }
});

//

//

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const userId = c.get("userId");

  try {
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json("incorrect inputs" + body.email);
    }
  } catch (e) {
    console.log(e);
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });

    return c.json({
      id: blog.id,
    });
  } catch (e) {
    console.log(e);
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  try {
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json("incorrect inputs" + body.email);
    }
  } catch (e) {
    console.log(e);
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    id: blog.id,
    title: blog.title,
  });
  // return c.text("signin route");
});

//pagination

blogRouter.get("/bulk", async (c) => {
  //const body = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.post.findMany({});
  //console.log(c.json(blogs));

  return c.json({ blogs });
});
//

//

//

//
blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });

    return c.json({
      blog,
    });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({
      message: "error while fetching ig",
    });
  }
});
