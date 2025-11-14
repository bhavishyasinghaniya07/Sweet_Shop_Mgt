const User = require("../../src/models/User");
const bcrypt = require("bcryptjs");

describe("User Model", () => {
  describe("User Creation", () => {
    it("should create a user with required fields", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const user = await User.create(userData);

      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe("user"); // Default role
    });

    it("should require username", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should require email", async () => {
      const userData = {
        username: "testuser",
        password: "password123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should require password", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should enforce unique email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      await User.create(userData);

      await expect(
        User.create({
          username: "testuser2",
          email: "test@example.com",
          password: "password456",
        })
      ).rejects.toThrow();
    });
  });

  describe("Password Hashing", () => {
    it("should hash password before saving", async () => {
      const password = "password123";
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password,
      });

      const isMatch = await bcrypt.compare(password, user.password);
      expect(isMatch).toBe(true);
      expect(user.password).not.toBe(password);
    });

    it("should not hash password if not modified", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const originalHash = user.password;
      user.username = "updateduser";
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe("Password Comparison Method", () => {
    it("should correctly compare passwords", async () => {
      const password = "password123";
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password,
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const isMatch = await user.comparePassword("wrongpassword");
      expect(isMatch).toBe(false);
    });
  });
});
