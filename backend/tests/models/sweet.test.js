const Sweet = require("../../src/models/Sweet");

describe("Sweet Model", () => {
  describe("Sweet Creation", () => {
    it("should create a sweet with all required fields", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
        description: "Delicious milk chocolate bar",
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.description).toBe(sweetData.description);
    });

    it("should require name", async () => {
      const sweetData = {
        category: "Chocolate",
        price: 2.99,
        quantity: 100,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it("should require category", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        price: 2.99,
        quantity: 100,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it("should require price", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        quantity: 100,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it("should require quantity", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it("should not allow negative price", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: -2.99,
        quantity: 100,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it("should not allow negative quantity", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: -10,
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });

    it("should set default quantity to 0 if not provided", async () => {
      const sweetData = {
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 0,
      };

      const sweet = await Sweet.create(sweetData);
      expect(sweet.quantity).toBe(0);
    });
  });

  describe("Sweet Methods", () => {
    it("should check if sweet is in stock", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 10,
      });

      expect(sweet.isInStock()).toBe(true);
    });

    it("should return false when sweet is out of stock", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 0,
      });

      expect(sweet.isInStock()).toBe(false);
    });

    it("should decrease quantity on purchase", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 10,
      });

      await sweet.purchase(3);
      expect(sweet.quantity).toBe(7);
    });

    it("should not allow purchase more than available quantity", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 5,
      });

      await expect(sweet.purchase(10)).rejects.toThrow("Insufficient quantity");
    });

    it("should increase quantity on restock", async () => {
      const sweet = await Sweet.create({
        name: "Chocolate Bar",
        category: "Chocolate",
        price: 2.99,
        quantity: 10,
      });

      await sweet.restock(20);
      expect(sweet.quantity).toBe(30);
    });
  });
});
