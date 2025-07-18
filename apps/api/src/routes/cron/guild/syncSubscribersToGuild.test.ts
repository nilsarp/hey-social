import type { Context } from "hono";
import lensPg from "src/utils/lensPg";
import syncAddressesToGuild from "src/utils/syncAddressesToGuild";
import { beforeEach, describe, expect, it, vi } from "vitest";
import syncSubscribersToGuild from "./syncSubscribersToGuild";

vi.mock("src/utils/lensPg", () => ({ default: { query: vi.fn() } }));
vi.mock("src/utils/syncAddressesToGuild", () => ({
  default: vi.fn(async () => ({ success: true }))
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("syncSubscribersToGuild", () => {
  it("queries db and syncs addresses", async () => {
    const buf = Buffer.from("3".repeat(40), "hex");
    (lensPg.query as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { account: buf }
    ]);
    const ctx = { json: vi.fn((b: unknown) => b) } as unknown as Context;

    const result = await syncSubscribersToGuild(ctx);

    expect(lensPg.query).toHaveBeenCalled();
    expect(syncAddressesToGuild).toHaveBeenCalledWith({
      addresses: [`0x${buf.toString("hex")}`],
      roleId: 173026,
      requirementId: 470539
    });
    expect(result).toEqual({ success: true });
  });

  it("returns success when no accounts are found", async () => {
    (lensPg.query as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const ctx = { json: vi.fn((b: unknown) => b) } as unknown as Context;

    const result = await syncSubscribersToGuild(ctx);

    expect(syncAddressesToGuild).toHaveBeenCalledWith({
      addresses: [],
      roleId: 173026,
      requirementId: 470539
    });
    expect(result).toEqual({ success: true });
  });
});
