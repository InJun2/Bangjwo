package com.bangjwo.global.common.util;

import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {
	public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
		ResponseCookie cookie = ResponseCookie.from(name, value)
			.path("/")
			.sameSite("None")
			.secure(true)
			.httpOnly(true)
			.maxAge(maxAge)
			.build();

		response.addHeader("Set-Cookie", cookie.toString());
	}

	public static void deleteRefreshToken(HttpServletResponse response) {
		ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
			.path("/")
			.sameSite("None")
			.secure(true)
			.httpOnly(true)
			.maxAge(0)
			.build();

		response.addHeader("Set-Cookie", cookie.toString());
	}
}
