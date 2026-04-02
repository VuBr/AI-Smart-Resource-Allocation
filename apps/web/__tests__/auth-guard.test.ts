/**
 * Unit tests for useAuthGuard hook.
 * Bảo vệ AC-5: Client-side route guard redirect về /login khi không có token.
 */
import { renderHook } from "@testing-library/react";

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock auth service
jest.mock("@/lib/services/auth", () => ({
  getToken: jest.fn(),
}));

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getToken } from "@/lib/services/auth";

const mockGetToken = getToken as jest.Mock;

describe("useAuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirect về /login khi không có token", () => {
    mockGetToken.mockReturnValue(null);

    renderHook(() => useAuthGuard());

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("redirect về /login khi token là empty string", () => {
    mockGetToken.mockReturnValue("");

    renderHook(() => useAuthGuard());

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("không redirect khi có token hợp lệ", () => {
    mockGetToken.mockReturnValue("mock.jwt.token.phase5");

    renderHook(() => useAuthGuard());

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
