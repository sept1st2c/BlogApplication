import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signinInput, signupInput } from "@sept1st2c/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

// const app = new

//app.get("/", async (c) => {});
userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  try {
    const { success } = signupInput.safeParse(body);
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
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.JWT_SECRET
    );
    return c.text("jwt here: " + jwt);
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.text("Invalid");
  }
  // return c.text("signup route");
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();

  try {
    const { success } = signinInput.safeParse(body);
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
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });
    if (!user) {
      c.status(411);
      return c.json({ error: "user not found" });
    }
    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.JWT_SECRET
    );
    return c.text("jwt here " + jwt);
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.text("Invalid");
  }
});
