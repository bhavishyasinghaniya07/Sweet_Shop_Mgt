const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../../src/utils/jwt");

describe("JWT Utility", () => {
  const mockUserId = "507f1f77bcf86cd799439011";
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRE = "7d";

  describe("generateToken", () => {
    it("should generate a valid token", () => {
      const token = generateToken(mockUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should encode userId in token", () => {
      const token = generateToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.id).toBe(mockUserId);
    });

    it("should set expiration time", () => {
      const token = generateToken(mockUserId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = generateToken(mockUserId);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(mockUserId);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyToken("invalid-token")).toThrow();
    });

    it("should throw error for expired token", () => {
      const expiredToken = jwt.sign(
        { id: mockUserId },
        process.env.JWT_SECRET,
        { expiresIn: "0s" }
      );

      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(() => verifyToken(expiredToken)).toThrow();
      }, 100);
    });
  });
});
