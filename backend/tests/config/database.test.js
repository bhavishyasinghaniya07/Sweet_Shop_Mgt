const mongoose = require("mongoose");
const connectDB = require("../../src/config/database");

describe("Database Connection", () => {
  afterEach(async () => {
    await mongoose.disconnect();
  });

  it("should connect to MongoDB successfully", async () => {
    const mockUri = "mongodb://localhost:27017/test";
    process.env.MONGODB_URI = mockUri;

    // Mock mongoose.connect
    const originalConnect = mongoose.connect;
    mongoose.connect = jest.fn().mockResolvedValue(true);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(mockUri);

    mongoose.connect = originalConnect;
  });

  it("should handle connection errors", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const processExitSpy = jest.spyOn(process, "exit").mockImplementation();

    mongoose.connect = jest
      .fn()
      .mockRejectedValue(new Error("Connection failed"));

    await connectDB();

    expect(consoleSpy).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});
