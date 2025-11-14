const request = require("supertest");
const express = require("express");
const sweetRoutes = require("../../src/routes/sweet");
const Sweet = require("../../src/models/Sweet");
const User = require("../../src/models/User");
const { generateToken } = require("../../src/utils/jwt");

const app = express();
app.use(express.json());
app.use("/api/sweets", sweetRoutes);

describe("Sweet Controller", () => {
  let userToken, adminToken, userId, adminId;

  beforeEach(async () => {
    // Create regular user
    const user = await User.create({
      username: "testuser",
      email: "user@example.com",
      password: "password123",
      role: "user",
    });
    userId = user._id;
    userToken = generateToken(user._id);

    // Create admin user
    const admin = await User.create({
      username: "adminuser",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    adminId = admin._id;
    adminToken = generateToken(admin._id);
  });

  describe("POST /api/sweets", () => {
    it("should create a new sweet with admin token", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
        description: "Delicious chocolate",
      };

      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet).toHaveProperty("name", sweetData.name);
      expect(response.body.data.sweet).toHaveProperty("price", sweetData.price);
    });

    it("should not create sweet without authentication", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      };

      await request(app).post("/api/sweets").send(sweetData).expect(401);
    });

    it("should not create sweet with user role", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      };

      await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`)
        .send(sweetData)
        .expect(403);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/sweets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Test" })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/sweets", () => {
    beforeEach(async () => {
      await Sweet.create([
        {
          name: "Chocolate Bar",
          category: "Chocolate",
          price: 2.99,
          quantity: 100,
        },
        {
          name: "Gummy Bears",
          category: "Gummy",
          price: 1.99,
          quantity: 50,
        },
        {
          name: "Lollipop",
          category: "Hard Candy",
          price: 0.99,
          quantity: 200,
        },
      ]);
    });

    it("should get all sweets with authentication", async () => {
      const response = await request(app)
        .get("/api/sweets")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toHaveLength(3);
    });

    it("should not get sweets without authentication", async () => {
      await request(app).get("/api/sweets").expect(401);
    });
  });

  describe("GET /api/sweets/search", () => {
    beforeEach(async () => {
      await Sweet.create([
        {
          name: "Milk Chocolate Bar",
          category: "Chocolate",
          price: 2.99,
          quantity: 100,
        },
        {
          name: "Dark Chocolate Bar",
          category: "Chocolate",
          price: 3.49,
          quantity: 50,
        },
        {
          name: "Gummy Bears",
          category: "Gummy",
          price: 1.99,
          quantity: 200,
        },
      ]);
    });

    it("should search sweets by name", async () => {
      const response = await request(app)
        .get("/api/sweets/search?name=chocolate")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toHaveLength(2);
    });

    it("should search sweets by category", async () => {
      const response = await request(app)
        .get("/api/sweets/search?category=Gummy")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toHaveLength(1);
      expect(response.body.data.sweets[0].category).toBe("Gummy");
    });

    it("should search sweets by price range", async () => {
      const response = await request(app)
        .get("/api/sweets/search?minPrice=2&maxPrice=3")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets.length).toBeGreaterThan(0);
    });

    it("should combine search filters", async () => {
      const response = await request(app)
        .get("/api/sweets/search?category=Chocolate&minPrice=3")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toHaveLength(1);
      expect(response.body.data.sweets[0].name).toBe("Dark Chocolate Bar");
    });
  });

  describe("GET /api/sweets/:id", () => {
    it("should get sweet by id", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      const response = await request(app)
        .get(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe("Chocolate Bar");
    });

    it("should return 404 for non-existent sweet", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app)
        .get(`/api/sweets/${fakeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/sweets/:id", () => {
    it("should update sweet with admin token", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      const updateData = {
        name: "Premium Chocolate Bar",
        price: 3.99,
      };

      const response = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe(updateData.name);
      expect(response.body.data.sweet.price).toBe(updateData.price);
    });

    it("should not update sweet with user role", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Updated Name" })
        .expect(403);
    });
  });

  describe("DELETE /api/sweets/:id", () => {
    it("should delete sweet with admin token", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      const response = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedSweet = await Sweet.findById(sweet._id);
      expect(deletedSweet).toBeNull();
    });

    it("should not delete sweet with user role", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe("POST /api/sweets/:id/purchase", () => {
    it("should purchase sweet successfully", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.quantity).toBe(95);
    });

    it("should not purchase more than available quantity", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 10,
      });

      await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 20 })
        .expect(400);
    });

    it("should require quantity field", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      });

      await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });
  });

  describe("POST /api/sweets/:id/restock", () => {
    it("should restock sweet with admin token", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 10,
      });

      const response = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.quantity).toBe(60);
    });

    it("should not restock with user role", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 10,
      });

      await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ quantity: 50 })
        .expect(403);
    });
  });
});
