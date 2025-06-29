import apolloClient from "@hey/indexer/apollo/client";
import type { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import getGroup from "./getGroup";
import "@hey/helpers/getAvatar";
import defaultMetadata from "src/utils/defaultMetadata";
import { getRedis, setRedis } from "src/utils/redis";

vi.mock("@hey/indexer/apollo/client", () => ({
  default: {
    query: vi.fn(async () => ({
      data: {
        group: {
          metadata: { name: "Group", description: "desc" },
          address: "0x1"
        }
      }
    }))
  }
}));
vi.mock("@hey/helpers/getAvatar", () => ({ default: vi.fn(() => "avatar") }));
vi.mock("src/utils/redis", () => ({ getRedis: vi.fn(), setRedis: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("og getGroup route", () => {
  it("generates html and caches result", async () => {
    (getRedis as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const html = vi.fn((b: string) => b);
    const ctx = {
      req: { param: vi.fn(() => ({ address: "0x1" })) },
      html
    } as unknown as Context;

    const result = await getGroup(ctx);

    expect(html).toHaveBeenCalled();
    expect(String(result)).toContain("Group on Hey");
    expect(setRedis).toHaveBeenCalled();
  });

  it("returns cached html when available", async () => {
    (getRedis as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "cached"
    );
    const html = vi.fn((b: string) => b);
    const ctx = {
      req: { param: vi.fn(() => ({ address: "0x1" })) },
      html
    } as unknown as Context;

    const result = await getGroup(ctx);

    expect(result).toBe("cached");
    expect(setRedis).not.toHaveBeenCalled();
  });

  it("returns default metadata when apollo query fails", async () => {
    (getRedis as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (
      apolloClient.query as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("fail"));
    const html = vi.fn((b: string) => b);
    const ctx = {
      req: { param: vi.fn(() => ({ address: "0x1" })) },
      html
    } as unknown as Context;

    const result = await getGroup(ctx);

    expect(html).toHaveBeenCalledWith(defaultMetadata, 500);
    expect(result).toBe(defaultMetadata);
  });

  it("handles redis errors gracefully", async () => {
    (getRedis as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("fail")
    );
    const html = vi.fn((b: string) => b);
    const ctx = {
      req: { param: vi.fn(() => ({ address: "0x1" })) },
      html
    } as unknown as Context;

    const result = await getGroup(ctx);

    expect(html).toHaveBeenCalledWith(defaultMetadata, 500);
    expect(result).toBe(defaultMetadata);
  });
});
