package com.bangjwo.global.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {
	public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
		Cookie cookie = new Cookie(name, value);
		cookie.setPath("/");
		cookie.setHttpOnly(true);
		// cookie.setSecure(true); // 💡 나중에 HTTPS 적용 시 주석 해제
		cookie.setMaxAge(maxAge);
		response.addCookie(cookie);
	}

	public static void deleteRefreshToken(HttpServletResponse response) {
		Cookie cookie = new Cookie("refreshToken", null);
		cookie.setMaxAge(0);
		cookie.setPath("/");
		cookie.setHttpOnly(true);
		// cookie.setSecure(false); // 이후 운영에서는 변경 https

		response.addCookie(cookie);
	}
}
