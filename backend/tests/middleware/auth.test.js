const { protect, authorize } = require("../../src/middleware/auth");
const User = require("../../src/models/User");
const { generateToken } = require("../../src/utils/jwt");

describe("Auth Middleware", () => {
  describe("protect middleware", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        user: null,
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should authenticate user with valid token", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const token = generateToken(user._id);
      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(next).toHaveBeenCalled();
    });

    it("should reject request without token", async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized, no token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token", async () => {
      req.headers.authorization = "Bearer invalid-token";

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject token with non-existent user", async () => {
      const fakeToken = generateToken("507f1f77bcf86cd799439011");
      req.headers.authorization = `Bearer ${fakeToken}`;

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("authorize middleware", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: null,
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should allow admin access", () => {
      req.user = { role: "admin" };

      authorize("admin")(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should deny non-admin access", () => {
      req.user = { role: "user" };

      authorize("admin")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to access this route",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow multiple roles", () => {
      req.user = { role: "user" };

      authorize("admin", "user")(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
